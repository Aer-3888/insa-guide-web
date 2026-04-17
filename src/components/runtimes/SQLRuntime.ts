import { BaseRuntime } from './BaseRuntime';
import type { RuntimeInfo } from './types';

type SqlJsStatic = {
  Database: new (data?: ArrayLike<number>) => SqlJsDatabase;
};

type SqlJsDatabase = {
  run: (sql: string) => void;
  exec: (sql: string) => Array<{ columns: string[]; values: unknown[][] }>;
  close: () => void;
};

type InitSqlJsFn = (config: {
  locateFile: (file: string) => string;
}) => Promise<SqlJsStatic>;

const SQL_JS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3';

function formatTable(columns: string[], rows: unknown[][]): string {
  const colWidths = columns.map((col, i) => {
    const maxDataWidth = rows.reduce((max, row) => {
      const cellWidth = String(row[i] ?? 'NULL').length;
      return Math.max(max, cellWidth);
    }, 0);
    return Math.max(col.length, maxDataWidth);
  });

  const header = columns
    .map((col, i) => col.padEnd(colWidths[i]))
    .join(' | ');

  const separator = colWidths.map((w) => '-'.repeat(w)).join('-+-');

  const dataRows = rows.map((row) =>
    row
      .map((cell, i) => String(cell ?? 'NULL').padEnd(colWidths[i]))
      .join(' | '),
  );

  const lines = [header, separator, ...dataRows];
  lines.push(`(${rows.length} row${rows.length !== 1 ? 's' : ''})`);
  return lines.join('\n');
}

declare global {
  interface Window {
    initSqlJs?: InitSqlJsFn;
  }
}

export class SQLRuntime extends BaseRuntime {
  private sqlJs: SqlJsStatic | null = null;
  private db: SqlJsDatabase | null = null;
  private datasets: Map<string, string> = new Map();

  getInfo(): RuntimeInfo {
    return {
      language: 'sql',
      displayName: 'SQL (SQLite)',
      bundleSize: '~1.5 MB',
      tier: 'medium',
      extensions: ['.sql'],
    };
  }

  async init(): Promise<void> {
    const initSqlJs = await this.loadSqlJs();
    this.sqlJs = await initSqlJs({
      locateFile: (file: string) => `${SQL_JS_CDN}/${file}`,
    });
    this.db = new this.sqlJs.Database();
  }

  private async loadSqlJs(): Promise<InitSqlJsFn> {
    return new Promise((resolve, reject) => {
      if (window.initSqlJs) {
        resolve(window.initSqlJs);
        return;
      }

      const script = document.createElement('script');
      script.src = `${SQL_JS_CDN}/sql-wasm.js`;
      script.async = true;

      script.onload = () => {
        if (window.initSqlJs) {
          resolve(window.initSqlJs);
        } else {
          reject(new Error('sql.js loaded but initSqlJs not found on window'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load sql.js from CDN'));
      };

      document.head.appendChild(script);
    });
  }

  async loadDataset(name: string, url: string): Promise<void> {
    if (this.datasets.has(name)) {
      return;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to load dataset "${name}": ${response.statusText}`,
      );
    }

    const sql = await response.text();
    this.datasets.set(name, sql);

    if (this.db) {
      this.db.run(sql);
    }
  }

  async executeCode(code: string): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const statements = code
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const outputs: string[] = [];

    for (const statement of statements) {
      const upperStatement = statement.toUpperCase().trimStart();

      if (
        upperStatement.startsWith('SELECT') ||
        upperStatement.startsWith('PRAGMA') ||
        upperStatement.startsWith('EXPLAIN') ||
        upperStatement.startsWith('WITH')
      ) {
        const results = this.db.exec(statement);
        for (const result of results) {
          outputs.push(formatTable(result.columns, result.values));
        }
        if (results.length === 0) {
          outputs.push('(no results)');
        }
      } else {
        this.db.run(statement);
        outputs.push(
          `OK: ${statement.split(/\s+/).slice(0, 3).join(' ')}...`,
        );
      }
    }

    return outputs.join('\n\n');
  }

  resetDatabase(): void {
    if (this.db) {
      this.db.close();
    }
    if (this.sqlJs) {
      this.db = new this.sqlJs.Database();
      // Re-load any registered datasets
      for (const sql of this.datasets.values()) {
        this.db.run(sql);
      }
    }
  }

  cleanup(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.sqlJs = null;
    this.datasets.clear();
    super.cleanup();
  }
}
