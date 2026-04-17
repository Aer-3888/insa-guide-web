// Web Worker for Python execution via Pyodide.
// Runs in a dedicated thread to avoid blocking the UI during
// Pyodide's ~40MB load and heavy computation.
//
// This file runs inside a Web Worker context. TypeScript's lib
// does not include worker globals by default, so we declare what
// we need locally.

/* eslint-disable no-restricted-globals */

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

interface WorkerRequest {
  type: 'init' | 'execute';
  code?: string;
  id?: number;
}

interface WorkerResponse {
  type: 'ready' | 'result' | 'error' | 'progress';
  id?: number;
  stdout?: string;
  stderr?: string;
  images?: string[];
  error?: string;
  progress?: string;
}

interface PyodideInterface {
  loadPackagesFromImports: (code: string) => Promise<void>;
  runPythonAsync: (code: string) => Promise<unknown>;
  runPython: (code: string) => unknown;
  globals: { get: (name: string) => unknown };
}

type LoadPyodideFn = (config: {
  indexURL: string;
}) => Promise<PyodideInterface>;

// Worker-scope declarations to avoid TS errors without pulling in
// the full webworker lib (which conflicts with the DOM lib).
declare function importScripts(...urls: string[]): void;
declare function postMessage(message: unknown): void;

let pyodide: PyodideInterface | null = null;

function postResponse(response: WorkerResponse): void {
  postMessage(response);
}

async function initPyodide(): Promise<void> {
  postResponse({
    type: 'progress',
    progress: 'Downloading Pyodide runtime...',
  });

  // Load Pyodide script into worker scope
  importScripts(`${PYODIDE_CDN}pyodide.js`);

  postResponse({
    type: 'progress',
    progress: 'Initializing Python interpreter...',
  });

  const workerScope = globalThis as unknown as Record<string, unknown>;
  const loadPyodide = workerScope['loadPyodide'] as LoadPyodideFn;

  pyodide = await loadPyodide({ indexURL: PYODIDE_CDN });

  // Set up stdout/stderr capture
  pyodide.runPython(`
import sys
import io

class OutputCapture:
    def __init__(self):
        self.buffer = io.StringIO()

    def write(self, text):
        self.buffer.write(text)

    def flush(self):
        pass

    def get_output(self):
        return self.buffer.getvalue()

    def reset(self):
        self.buffer = io.StringIO()

__stdout_capture = OutputCapture()
__stderr_capture = OutputCapture()
  `);

  postResponse({ type: 'ready' });
}

async function executeCode(code: string, id: number): Promise<void> {
  if (!pyodide) {
    postResponse({
      type: 'error',
      id,
      error: 'Pyodide not initialized',
    });
    return;
  }

  try {
    // Auto-detect and load packages from imports
    postResponse({
      type: 'progress',
      progress: 'Checking package dependencies...',
    });
    await pyodide.loadPackagesFromImports(code);

    // Configure matplotlib for non-interactive backend if imported
    const usesMatplotlib =
      code.includes('matplotlib') || code.includes('plt.');

    if (usesMatplotlib) {
      pyodide.runPython(`
import matplotlib
matplotlib.use('agg')
import matplotlib.pyplot as plt
plt.close('all')
      `);
    }

    // Redirect stdout/stderr and execute
    pyodide.runPython(`
__stdout_capture.reset()
__stderr_capture.reset()
sys.stdout = __stdout_capture
sys.stderr = __stderr_capture
    `);

    await pyodide.runPythonAsync(code);

    // Restore and collect output
    pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
    `);

    const stdout = String(
      pyodide.runPython('__stdout_capture.get_output()') ?? '',
    );
    const stderr = String(
      pyodide.runPython('__stderr_capture.get_output()') ?? '',
    );

    // Collect matplotlib figures as base64 images
    const images: string[] = [];
    if (usesMatplotlib) {
      const figCount = Number(
        pyodide.runPython(`
import matplotlib.pyplot as plt
len(plt.get_fignums())
        `) ?? 0,
      );

      if (figCount > 0) {
        pyodide.runPython(`
import base64
import io as _io

__plot_images = []
for fig_num in plt.get_fignums():
    fig = plt.figure(fig_num)
    buf = _io.BytesIO()
    fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    __plot_images.append('data:image/png;base64,' + img_base64)
    buf.close()
plt.close('all')
        `);

        const imgList = pyodide.globals.get('__plot_images') as
          | { toJs: () => string[] }
          | undefined;
        if (imgList && typeof imgList.toJs === 'function') {
          images.push(...imgList.toJs());
        }
      }
    }

    postResponse({ type: 'result', id, stdout, stderr, images });
  } catch (err) {
    // Restore stdout/stderr on error
    try {
      pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
      `);
    } catch {
      // Ignore cleanup errors
    }

    const message = err instanceof Error ? err.message : String(err);
    postResponse({ type: 'error', id, error: message });
  }
}

addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const { type, code, id } = event.data;

  switch (type) {
    case 'init':
      initPyodide().catch((err) => {
        postResponse({
          type: 'error',
          error: `Failed to initialize Pyodide: ${err instanceof Error ? err.message : String(err)}`,
        });
      });
      break;

    case 'execute':
      if (code !== undefined && id !== undefined) {
        executeCode(code, id).catch((err) => {
          postResponse({
            type: 'error',
            id,
            error: `Execution failed: ${err instanceof Error ? err.message : String(err)}`,
          });
        });
      }
      break;
  }
});
