import { BaseRuntime } from './BaseRuntime';
import type { ExecutionOptions, ExecutionResult, RuntimeInfo } from './types';

const PYTHON_TIMEOUT = 30000;

interface WorkerResponse {
  type: 'ready' | 'result' | 'error' | 'progress';
  id?: number;
  stdout?: string;
  stderr?: string;
  images?: string[];
  error?: string;
  progress?: string;
}

export class PythonRuntime extends BaseRuntime {
  private worker: Worker | null = null;
  private requestId = 0;
  private pendingRequests = new Map<
    number,
    {
      resolve: (value: { stdout: string; stderr: string; images: string[] }) => void;
      reject: (reason: Error) => void;
    }
  >();
  private onProgress: ((message: string) => void) | null = null;

  getInfo(): RuntimeInfo {
    return {
      language: 'python',
      displayName: 'Python (Pyodide)',
      bundleSize: '~40 MB',
      tier: 'heavy',
      extensions: ['.py'],
    };
  }

  setProgressCallback(callback: ((message: string) => void) | null): void {
    this.onProgress = callback;
  }

  async init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.worker = new Worker(
          new URL('../../workers/python-worker.ts', import.meta.url),
          { type: 'module' },
        );
      } catch {
        // Fallback for environments where URL-based worker creation fails
        this.worker = new Worker(
          new URL('../../workers/python-worker.ts', import.meta.url),
        );
      }

      const handleMessage = (event: MessageEvent<WorkerResponse>): void => {
        const data = event.data;

        switch (data.type) {
          case 'progress':
            if (this.onProgress && data.progress) {
              this.onProgress(data.progress);
            }
            break;

          case 'ready':
            this.worker!.removeEventListener('message', handleMessage);
            this.setupWorkerListeners();
            resolve();
            break;

          case 'error':
            if (data.id === undefined) {
              // Init error
              this.worker!.removeEventListener('message', handleMessage);
              reject(new Error(data.error ?? 'Unknown initialization error'));
            }
            break;
        }
      };

      this.worker.addEventListener('message', handleMessage);
      this.worker.addEventListener('error', (e) => {
        reject(new Error(`Worker error: ${e.message}`));
      });

      this.worker.postMessage({ type: 'init' });
    });
  }

  private setupWorkerListeners(): void {
    if (!this.worker) return;

    this.worker.addEventListener(
      'message',
      (event: MessageEvent<WorkerResponse>) => {
        const data = event.data;

        if (data.type === 'progress') {
          if (this.onProgress && data.progress) {
            this.onProgress(data.progress);
          }
          return;
        }

        if (data.id === undefined) return;

        const pending = this.pendingRequests.get(data.id);
        if (!pending) return;

        this.pendingRequests.delete(data.id);

        if (data.type === 'error') {
          pending.reject(new Error(data.error ?? 'Unknown error'));
        } else {
          pending.resolve({
            stdout: data.stdout ?? '',
            stderr: data.stderr ?? '',
            images: data.images ?? [],
          });
        }
      },
    );
  }

  async executeCode(code: string): Promise<string> {
    // This method satisfies BaseRuntime's abstract contract but the real
    // work goes through the overridden `execute` to preserve images.
    const result = await this.executeInWorker(code);
    return result.stdout;
  }

  private executeInWorker(
    code: string,
  ): Promise<{ stdout: string; stderr: string; images: string[] }> {
    if (!this.worker) {
      return Promise.reject(new Error('Worker not initialized'));
    }

    const id = ++this.requestId;
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.worker!.postMessage({ type: 'execute', code, id });
    });
  }

  /**
   * Override base execute to preserve images from matplotlib and
   * apply the longer Python-specific timeout.
   */
  async execute(
    code: string,
    options?: ExecutionOptions,
  ): Promise<ExecutionResult> {
    const timeout = options?.timeout ?? PYTHON_TIMEOUT;
    const maxOutputLength = options?.maxOutputLength ?? 10000;

    if (this.status === 'unloaded') {
      this.status = 'loading';
      try {
        await this.init();
        this.status = 'ready';
      } catch (err) {
        this.status = 'error';
        return {
          stdout: '',
          stderr: '',
          error: `Failed to initialize Pyodide: ${err instanceof Error ? err.message : String(err)}`,
          executionTime: 0,
        };
      }
    }

    if (this.status === 'error') {
      return {
        stdout: '',
        stderr: '',
        error: 'Runtime is in error state. Create a new instance.',
        executionTime: 0,
      };
    }

    if (this.status === 'executing') {
      return {
        stdout: '',
        stderr: '',
        error: 'Runtime is already executing. Wait or interrupt first.',
        executionTime: 0,
      };
    }

    this.status = 'executing';
    const startTime = performance.now();

    try {
      const result = await Promise.race([
        this.executeInWorker(code),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Execution timed out after ${timeout}ms`)),
            timeout,
          ),
        ),
      ]);

      const executionTime = performance.now() - startTime;
      this.status = 'ready';

      const truncate = (s: string): string =>
        s.length > maxOutputLength
          ? s.slice(0, maxOutputLength) +
            `\n...[output truncated at ${maxOutputLength} characters]`
          : s;

      return {
        stdout: truncate(result.stdout),
        stderr: truncate(result.stderr),
        images: result.images.length > 0 ? result.images : undefined,
        executionTime,
      };
    } catch (err) {
      const executionTime = performance.now() - startTime;
      this.status = 'ready';

      return {
        stdout: '',
        stderr: '',
        error: err instanceof Error ? err.message : String(err),
        executionTime,
      };
    }
  }

  interrupt(): void {
    // Terminating and recreating the worker is the only reliable way
    // to interrupt Pyodide execution.
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    // Reject all pending requests
    for (const [, pending] of this.pendingRequests) {
      pending.reject(new Error('Execution was interrupted'));
    }
    this.pendingRequests.clear();

    this.status = 'unloaded';
  }

  cleanup(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
    this.onProgress = null;
    super.cleanup();
  }
}
