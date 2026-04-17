export interface ExecutionOptions {
  timeout?: number;
  stdin?: string;
  maxOutputLength?: number;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  error?: string;
  images?: string[]; // base64 data URLs for plots
  executionTime: number;
}

export type RuntimeStatus =
  | 'unloaded'
  | 'loading'
  | 'ready'
  | 'executing'
  | 'error';

export interface RuntimeInfo {
  language: string;
  displayName: string;
  bundleSize: string;
  tier: 'light' | 'medium' | 'heavy';
  extensions: string[];
}
