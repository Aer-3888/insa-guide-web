import type { RuntimeInfo } from './types';
import type { BaseRuntime } from './BaseRuntime';
import { JavaScriptRuntime } from './JavaScriptRuntime';
import { PythonRuntime } from './PythonRuntime';
import { SQLRuntime } from './SQLRuntime';

export interface RuntimeRegistryEntry extends RuntimeInfo {
  factory: () => BaseRuntime;
}

export const RUNTIME_REGISTRY: Record<string, RuntimeRegistryEntry> = {
  javascript: {
    language: 'javascript',
    displayName: 'JavaScript',
    bundleSize: '<1 KB',
    tier: 'light',
    extensions: ['.js', '.mjs'],
    factory: () => new JavaScriptRuntime(),
  },
  python: {
    language: 'python',
    displayName: 'Python (Pyodide)',
    bundleSize: '~40 MB',
    tier: 'heavy',
    extensions: ['.py'],
    factory: () => new PythonRuntime(),
  },
  sql: {
    language: 'sql',
    displayName: 'SQL (SQLite)',
    bundleSize: '~1.5 MB',
    tier: 'medium',
    extensions: ['.sql'],
    factory: () => new SQLRuntime(),
  },
  // Phase 2: r, java, c
  // Phase 3: ocaml, prolog, arm
};

export const EXECUTABLE_LANGUAGES = Object.keys(RUNTIME_REGISTRY);

export function isExecutableLanguage(language: string): boolean {
  return language in RUNTIME_REGISTRY;
}

export function getRuntimeInfo(language: string): RuntimeInfo | undefined {
  return RUNTIME_REGISTRY[language];
}

export function createRuntime(language: string): BaseRuntime {
  const entry = RUNTIME_REGISTRY[language];
  if (!entry) {
    throw new Error(
      `No runtime registered for language "${language}". ` +
      `Available: ${EXECUTABLE_LANGUAGES.join(', ')}`,
    );
  }
  return entry.factory();
}
