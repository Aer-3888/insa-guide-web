import { BaseRuntime } from './BaseRuntime';
import type { RuntimeInfo } from './types';

const JS_TIMEOUT = 5000;

interface IframeMessage {
  type: 'result' | 'error';
  output?: string;
  error?: string;
}

export class JavaScriptRuntime extends BaseRuntime {
  async init(): Promise<void> {
    // No heavy loading needed -- iframe created per execution
  }

  getInfo(): RuntimeInfo {
    return {
      language: 'javascript',
      displayName: 'JavaScript',
      bundleSize: '<1 KB',
      tier: 'light',
      extensions: ['.js', '.mjs'],
    };
  }

  async executeCode(code: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.sandbox.add('allow-scripts');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const timeoutId = setTimeout(() => {
        destroyIframe();
        reject(new Error(`Execution timed out after ${JS_TIMEOUT}ms`));
      }, JS_TIMEOUT);

      function destroyIframe(): void {
        clearTimeout(timeoutId);
        window.removeEventListener('message', handleMessage);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }

      function handleMessage(event: MessageEvent<IframeMessage>): void {
        // Only accept messages from our iframe
        if (event.source !== iframe.contentWindow) {
          return;
        }

        const data = event.data;
        destroyIframe();

        if (data.type === 'error') {
          reject(new Error(data.error ?? 'Unknown error'));
        } else {
          resolve(data.output ?? '');
        }
      }

      window.addEventListener('message', handleMessage);

      const scriptContent = `
        (function() {
          var __output = [];

          function __capture(level) {
            return function() {
              var args = Array.prototype.slice.call(arguments);
              var line = args.map(function(a) {
                if (typeof a === 'object') {
                  try { return JSON.stringify(a, null, 2); }
                  catch(e) { return String(a); }
                }
                return String(a);
              }).join(' ');
              if (level === 'error' || level === 'warn') {
                __output.push('[' + level.toUpperCase() + '] ' + line);
              } else {
                __output.push(line);
              }
            };
          }

          console.log = __capture('log');
          console.error = __capture('error');
          console.warn = __capture('warn');
          console.info = __capture('log');
          console.debug = __capture('log');

          try {
            var __result = (function() {
              ${code}
            })();
            if (__result !== undefined && __result !== null) {
              __output.push(typeof __result === 'object'
                ? JSON.stringify(__result, null, 2)
                : String(__result));
            }
            parent.postMessage({ type: 'result', output: __output.join('\\n') }, '*');
          } catch(e) {
            parent.postMessage({ type: 'error', error: e.message || String(e) }, '*');
          }
        })();
      `;

      const html = [
        '<!DOCTYPE html><html><head></head><body><script>',
        scriptContent,
        '<\/script></body></html>',
      ].join('');
      const blob = new Blob([html], { type: 'text/html' });
      iframe.src = URL.createObjectURL(blob);
    });
  }

  cleanup(): void {
    super.cleanup();
    // iframes are destroyed after each execution, nothing persistent to clean
  }
}
