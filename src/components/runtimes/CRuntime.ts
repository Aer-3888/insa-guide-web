import { BaseRuntime } from './BaseRuntime';
import type { RuntimeInfo } from './types';

const JSCPP_CDN =
  'https://cdn.jsdelivr.net/npm/jscpp@2.1.2/dist/JSCPP.es5.min.js';

declare global {
  interface Window {
    JSCPP?: any;
  }
}

export class CRuntime extends BaseRuntime {
  getInfo(): RuntimeInfo {
    return {
      language: 'c',
      displayName: 'C (JSCPP)',
      bundleSize: '~200 KB',
      tier: 'medium',
      extensions: ['.c', '.h'],
    };
  }

  async init(): Promise<void> {
    await this.loadJSCPP();
  }

  private async loadJSCPP(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.JSCPP) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = JSCPP_CDN;
      script.async = true;

      script.onload = () => {
        if (window.JSCPP) {
          resolve();
        } else {
          reject(new Error('JSCPP loaded but not found on window'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load JSCPP from CDN'));
      };

      document.head.appendChild(script);
    });
  }

  async executeCode(code: string): Promise<string> {
    if (!window.JSCPP) {
      throw new Error('JSCPP not initialized');
    }

    let output = '';

    const config = {
      stdio: {
        write: (s: string) => {
          output += s;
        },
      },
      unsigned_overflow: 'warn',
    };

    try {
      const exitCode: number = window.JSCPP.run(code, '', config);
      if (exitCode !== 0) {
        output += `\nProcess exited with code ${exitCode}`;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);

      if (output.length > 0) {
        return `${output}\n[Error] ${message}`;
      }

      throw new Error(message);
    }

    return output;
  }

  cleanup(): void {
    super.cleanup();
  }
}
