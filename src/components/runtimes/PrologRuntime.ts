import { BaseRuntime } from './BaseRuntime';
import type { RuntimeInfo } from './types';

const TAU_PROLOG_CDN = 'https://cdn.jsdelivr.net/npm/tau-prolog@0.3.4/modules';
const MAX_ANSWERS = 100;

declare global {
  interface Window {
    pl?: TauPrologStatic;
  }
}

type TauPrologStatic = {
  create: (limit?: number) => TauPrologSession;
  format_answer: (answer: TauPrologAnswer) => string;
  type: {
    is_substitution: (answer: TauPrologAnswer) => boolean;
  };
};

type TauPrologAnswer = {
  id: string;
  links: Record<string, unknown>;
};

type TauPrologSession = {
  consult: (
    program: string,
    options: { success: () => void; error: (err: unknown) => void },
  ) => void;
  query: (
    query: string,
    options: { success: (goal: unknown) => void; error: (err: unknown) => void },
  ) => void;
  answer: (options: {
    success: (answer: TauPrologAnswer) => void;
    error: (err: unknown) => void;
    fail: () => void;
    limit: () => void;
  }) => void;
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      reject(new Error(`Failed to load script: ${src}`));
    };

    document.head.appendChild(script);
  });
}

function parseCodeBlock(code: string): { program: string; queries: string[] } {
  const lines = code.split('\n');
  const programLines: string[] = [];
  const queries: string[] = [];
  let currentQuery: string[] = [];
  let inQuery = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('?-')) {
      if (inQuery && currentQuery.length > 0) {
        queries.push(currentQuery.join(' '));
      }
      inQuery = true;
      const queryPart = trimmed.slice(2).trim();
      currentQuery = queryPart.length > 0 ? [queryPart] : [];
    } else if (inQuery) {
      if (trimmed.length > 0) {
        currentQuery.push(trimmed);
      }
    } else {
      programLines.push(line);
    }
  }

  if (inQuery && currentQuery.length > 0) {
    queries.push(currentQuery.join(' '));
  }

  const normalizedQueries = queries.map((q) => {
    const cleaned = q.trim();
    if (cleaned.endsWith('.')) {
      return cleaned;
    }
    return cleaned + '.';
  });

  return {
    program: programLines.join('\n').trim(),
    queries: normalizedQueries,
  };
}

function formatError(err: unknown): string {
  if (err === null || err === undefined) {
    return 'Unknown error';
  }
  if (typeof err === 'string') {
    return err;
  }
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'object' && 'args' in err) {
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }
  return String(err);
}

export class PrologRuntime extends BaseRuntime {
  private pl: TauPrologStatic | null = null;

  getInfo(): RuntimeInfo {
    return {
      language: 'prolog',
      displayName: 'Prolog (Tau Prolog)',
      bundleSize: '~200 KB',
      tier: 'light',
      extensions: ['.pl', '.pro'],
    };
  }

  async init(): Promise<void> {
    this.pl = await this.loadTauProlog();
  }

  private async loadTauProlog(): Promise<TauPrologStatic> {
    if (window.pl) {
      return window.pl;
    }

    await loadScript(`${TAU_PROLOG_CDN}/core.js`);

    if (!window.pl) {
      throw new Error('Tau Prolog loaded but pl not found on window');
    }

    await Promise.all([
      loadScript(`${TAU_PROLOG_CDN}/lists.js`),
      loadScript(`${TAU_PROLOG_CDN}/js.js`),
    ]);

    return window.pl;
  }

  async executeCode(code: string): Promise<string> {
    if (!this.pl) {
      throw new Error('Tau Prolog not initialized');
    }

    const { program, queries } = parseCodeBlock(code);
    const session = this.pl.create(1000);

    if (program.length > 0) {
      await this.consult(session, program);
    }

    if (queries.length === 0) {
      if (program.length > 0) {
        return 'Program loaded successfully.\n(No queries found. Use ?- query. to run queries.)';
      }
      return '(No program or queries found.)';
    }

    const outputs: string[] = [];

    for (const query of queries) {
      const queryDisplay = `?- ${query}`;
      const answers = await this.runQuery(session, query);
      outputs.push(`${queryDisplay}\n${answers}`);
    }

    return outputs.join('\n\n');
  }

  private consult(session: TauPrologSession, program: string): Promise<void> {
    return new Promise((resolve, reject) => {
      session.consult(program, {
        success: () => {
          resolve();
        },
        error: (err) => {
          reject(new Error(`Consult error: ${formatError(err)}`));
        },
      });
    });
  }

  private async runQuery(
    session: TauPrologSession,
    query: string,
  ): Promise<string> {
    await new Promise<void>((resolve, reject) => {
      session.query(query, {
        success: () => {
          resolve();
        },
        error: (err) => {
          reject(new Error(`Query error: ${formatError(err)}`));
        },
      });
    });

    const answers: string[] = [];
    let done = false;
    let answerCount = 0;

    while (!done && answerCount < MAX_ANSWERS) {
      await new Promise<void>((resolve) => {
        session.answer({
          success: (answer) => {
            answerCount++;
            const formatted = this.pl!.format_answer(answer);
            answers.push(formatted);
            resolve();
          },
          error: (err) => {
            answers.push(`error: ${formatError(err)}`);
            done = true;
            resolve();
          },
          fail: () => {
            done = true;
            resolve();
          },
          limit: () => {
            answers.push('Warning: inference limit reached.');
            done = true;
            resolve();
          },
        });
      });
    }

    if (answerCount >= MAX_ANSWERS) {
      answers.push(`... (stopped after ${MAX_ANSWERS} answers)`);
    }

    if (answers.length === 0) {
      return 'false.';
    }

    return answers.join('\n');
  }

  cleanup(): void {
    this.pl = null;
    super.cleanup();
  }
}
