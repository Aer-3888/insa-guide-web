import { BaseRuntime } from './BaseRuntime';
import type { RuntimeInfo } from './types';

const OCAML_WASM_CDN =
  'https://cdn.jsdelivr.net/npm/@nicolo-ribaudo/ocaml-wasm@5.3.0-2/dist/ocaml.js';

declare global {
  interface Window {
    OCaml?: {
      create(): Promise<OCamlInstance>;
    };
  }
}

interface OCamlInstance {
  eval(code: string): { stdout: string; stderr: string; value: string };
}

export class OCamlRuntime extends BaseRuntime {
  private instance: OCamlInstance | null = null;

  getInfo(): RuntimeInfo {
    return {
      language: 'ocaml',
      displayName: 'OCaml',
      bundleSize: '~5 MB',
      tier: 'medium',
      extensions: ['.ml', '.mli'],
    };
  }

  async init(): Promise<void> {
    await this.loadOCamlWasm();
    this.instance = await this.createInstance();
  }

  private async loadOCamlWasm(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.OCaml) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = OCAML_WASM_CDN;
      script.async = true;

      script.onload = () => {
        if (window.OCaml) {
          resolve();
        } else {
          reject(new Error('OCaml WASM loaded but not found on window'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load OCaml WASM from CDN'));
      };

      document.head.appendChild(script);
    });
  }

  private async createInstance(): Promise<OCamlInstance> {
    if (!window.OCaml) {
      throw new Error('OCaml WASM not loaded');
    }

    try {
      return await window.OCaml.create();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to create OCaml instance: ${message}`);
    }
  }

  async executeCode(code: string): Promise<string> {
    if (!this.instance) {
      throw new Error('OCaml instance not initialized');
    }

    try {
      const result = this.instance.eval(code);
      const parts: string[] = [];

      if (result.stdout) {
        parts.push(result.stdout);
      }

      if (result.stderr) {
        parts.push(`[stderr] ${result.stderr}`);
      }

      if (result.value) {
        parts.push(result.value);
      }

      return parts.join('\n');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(message);
    }
  }

  cleanup(): void {
    this.instance = null;
    super.cleanup();
  }
}
