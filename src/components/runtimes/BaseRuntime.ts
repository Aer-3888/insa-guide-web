import type {
  ExecutionOptions,
  ExecutionResult,
  RuntimeInfo,
  RuntimeStatus,
} from './types';

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_MAX_OUTPUT_LENGTH = 10000;

function truncateOutput(output: string, maxLength: number): string {
  if (output.length <= maxLength) {
    return output;
  }
  return (
    output.slice(0, maxLength) +
    `\n...[output truncated at ${maxLength} characters]`
  );
}

function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Execution timed out after ${ms}ms`));
    }, ms);
  });
}

export abstract class BaseRuntime {
  protected status: RuntimeStatus = 'unloaded';
  private abortController: AbortController | null = null;

  abstract init(): Promise<void>;

  abstract executeCode(code: string): Promise<string>;

  abstract getInfo(): RuntimeInfo;

  getStatus(): RuntimeStatus {
    return this.status;
  }

  async execute(
    code: string,
    options?: ExecutionOptions,
  ): Promise<ExecutionResult> {
    const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
    const maxOutputLength =
      options?.maxOutputLength ?? DEFAULT_MAX_OUTPUT_LENGTH;

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
          error: `Failed to initialize runtime: ${err instanceof Error ? err.message : String(err)}`,
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
    this.abortController = new AbortController();
    const startTime = performance.now();

    try {
      const rawOutput = await Promise.race([
        this.executeCode(code),
        createTimeoutPromise(timeout),
        new Promise<never>((_, reject) => {
          this.abortController!.signal.addEventListener('abort', () => {
            reject(new Error('Execution was interrupted'));
          });
        }),
      ]);

      const executionTime = performance.now() - startTime;
      this.status = 'ready';

      return {
        stdout: truncateOutput(rawOutput, maxOutputLength),
        stderr: '',
        executionTime,
      };
    } catch (err) {
      const executionTime = performance.now() - startTime;
      this.status = 'ready';
      const message =
        err instanceof Error ? err.message : String(err);

      return {
        stdout: '',
        stderr: '',
        error: message,
        executionTime,
      };
    } finally {
      this.abortController = null;
    }
  }

  interrupt(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  cleanup(): void {
    this.interrupt();
    this.status = 'unloaded';
  }
}
