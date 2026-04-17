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
  images: ImageBitmap[];
  result: unknown;
}

interface WebRShelter {
  captureR: (
    code: string,
    options?: { withAutoprint?: boolean; captureGraphics?: boolean | { width?: number; height?: number } },
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

async function imageBitmapToDataURL(bitmap: ImageBitmap): Promise<string> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:image/png;base64,${btoa(binary)}`;
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

  webR = new WebRModule.WebR();
  await webR.init();

  shelter = await new webR.Shelter();

  // Set UTF-8 locale so French accented characters in comments/strings
  // don't cause parse errors.
  try {
    await shelter.captureR('Sys.setlocale("LC_ALL", "C.UTF-8")', {});
    await shelter.purge();
  } catch {
    // Ignore if locale not available — non-fatal
  }

  postResponse({ type: 'ready' });
}

// Strip lines that require a local filesystem or network and cannot
// work inside the WebR WASM sandbox.
const UNSUPPORTED_CALLS = /^\s*(setwd|source|install\.packages)\s*\(/;

function sanitizeRCode(code: string): { sanitized: string; warnings: string[] } {
  const lines = code.split('\n');
  const kept: string[] = [];
  const warnings: string[] = [];

  for (const line of lines) {
    if (UNSUPPORTED_CALLS.test(line)) {
      warnings.push(`# Skipped (not available in browser): ${line.trim()}`);
    } else {
      kept.push(line);
    }
  }

  return { sanitized: kept.join('\n'), warnings };
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
    const { sanitized, warnings } = sanitizeRCode(code);

    if (sanitized.trim().length === 0) {
      postResponse({
        type: 'result',
        id,
        stdout: warnings.length > 0
          ? warnings.join('\n') + '\n\n(No executable R code remaining after filtering browser-incompatible calls.)'
          : '(Empty code block)',
        stderr: '',
        images: [],
      });
      return;
    }

    const result = await shelter.captureR(sanitized, {
      withAutoprint: true,
      captureGraphics: { width: 600, height: 400 },
    });

    const prefix = warnings.length > 0 ? warnings.join('\n') + '\n\n' : '';
    const stdout = prefix + result.output
      .filter((o) => o.type === 'stdout')
      .map((o) => o.data)
      .join('\n');

    const stderr = result.output
      .filter((o) => o.type === 'stderr')
      .map((o) => o.data)
      .join('\n');

    const images: string[] = [];
    if (result.images && result.images.length > 0) {
      for (const img of result.images) {
        const dataUrl = await imageBitmapToDataURL(img);
        images.push(dataUrl);
      }
    }

    postResponse({ type: 'result', id, stdout, stderr, images });
  } catch (err) {
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
