// Web Worker for R execution via WebR.
// Runs in a dedicated thread to avoid blocking the UI during
// WebR's ~20MB load and R computation.
//
// This file runs inside a Web Worker context. TypeScript's lib
// does not include worker globals by default, so we declare what
// we need locally.

// Force TypeScript to treat this file as a module so that its
// declarations don't collide with other worker files.
export {};

/* eslint-disable no-restricted-globals */

const WEBR_CDN = 'https://webr.r-wasm.org/v0.4.4/';

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

// Minimal type declarations for WebR. The full types are not
// available in the worker context; we declare only what we use.
interface WebRCaptureOutput {
  type: 'stdout' | 'stderr';
  data: string;
}

interface WebRCaptureResult {
  output: WebRCaptureOutput[];
  images: Array<{ type: string; data: Uint8Array }>;
  result: unknown;
}

interface WebRShelter {
  captureR: (
    code: string,
    options?: { withAutoprint?: boolean },
  ) => Promise<WebRCaptureResult>;
  purge: () => Promise<void>;
}

interface WebRInstance {
  init: () => Promise<void>;
  Shelter: new () => Promise<WebRShelter>;
}

interface WebRConstructor {
  new (options?: Record<string, unknown>): WebRInstance;
}

// Worker-scope declarations to avoid TS errors without pulling in
// the full webworker lib (which conflicts with the DOM lib).
declare function postMessage(message: unknown): void;

let webR: WebRInstance | null = null;
let shelter: WebRShelter | null = null;

function postResponse(response: WorkerResponse): void {
  postMessage(response);
}

function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

async function initWebR(): Promise<void> {
  postResponse({
    type: 'progress',
    progress: 'Downloading WebR runtime...',
  });

  // Load WebR via dynamic import from CDN.
  // WebR ships as an ES module, so dynamic import is the correct
  // way to load it in a module-type worker.
  let WebRModule: { WebR: WebRConstructor };
  try {
    WebRModule = (await import(
      /* webpackIgnore: true */ `${WEBR_CDN}webr.mjs`
    )) as { WebR: WebRConstructor };
  } catch (importErr) {
    throw new Error(
      `Failed to load WebR from CDN: ${importErr instanceof Error ? importErr.message : String(importErr)}`,
    );
  }

  postResponse({
    type: 'progress',
    progress: 'Initializing R interpreter...',
  });

  // Create WebR instance. Let WebR automatically pick the best
  // communication channel (SharedArrayBuffer if COOP/COEP headers
  // are present, ServiceWorker fallback otherwise).
  webR = new WebRModule.WebR();
  await webR.init();

  // Create a shelter for memory-managed R evaluation.
  shelter = await new webR.Shelter();

  postResponse({ type: 'ready' });
}

async function executeCode(code: string, id: number): Promise<void> {
  if (!webR || !shelter) {
    postResponse({
      type: 'error',
      id,
      error: 'WebR not initialized',
    });
    return;
  }

  try {
    // Execute R code with autoprint enabled (mimics interactive R
    // behavior where expression results are printed automatically).
    const result = await shelter.captureR(code, { withAutoprint: true });

    // Separate stdout and stderr from captured output.
    const stdout = result.output
      .filter((o) => o.type === 'stdout')
      .map((o) => o.data)
      .join('\n');

    const stderr = result.output
      .filter((o) => o.type === 'stderr')
      .map((o) => o.data)
      .join('\n');

    // Convert any captured plot images to base64 data URLs.
    const images: string[] = [];
    if (result.images && result.images.length > 0) {
      for (const img of result.images) {
        const base64 = arrayBufferToBase64(img.data);
        images.push(`data:image/png;base64,${base64}`);
      }
    }

    // Release R objects created during this evaluation to prevent
    // memory leaks across executions.
    await shelter.purge();

    postResponse({ type: 'result', id, stdout, stderr, images });
  } catch (err) {
    // Purge shelter on error to avoid leaking R objects.
    try {
      await shelter.purge();
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
      initWebR().catch((err) => {
        postResponse({
          type: 'error',
          error: `Failed to initialize WebR: ${err instanceof Error ? err.message : String(err)}`,
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
