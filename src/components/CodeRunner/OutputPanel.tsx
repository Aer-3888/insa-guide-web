import { useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ExecutionResult, RuntimeStatus } from '../runtimes/types';
import styles from './CodeRunner.module.css';

interface OutputPanelProps {
  readonly result: ExecutionResult | null;
  readonly status: RuntimeStatus;
  readonly onClear: () => void;
}

function Spinner(): ReactNode {
  return (
    <span className={styles.spinner} role="status" aria-label="Running">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export default function OutputPanel({
  result,
  status,
  onClear,
}: OutputPanelProps): ReactNode {
  const isActive = status === 'loading' || status === 'executing';

  const handleCopy = useCallback(async () => {
    if (!result) return;
    const text = [result.stdout, result.stderr, result.error]
      .filter(Boolean)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API may not be available in all contexts.
    }
  }, [result]);

  if (!result && !isActive) return null;

  return (
    <div className={styles.output} role="region" aria-label="Execution output">
      {/* Toolbar */}
      <div className={styles.outputToolbar}>
        <span className={styles.outputTitle}>Output</span>
        <span className={styles.outputActions}>
          {result && (
            <span className={styles.timeBadge}>
              {formatTime(result.executionTime)}
            </span>
          )}
          {result && (
            <button
              type="button"
              className={styles.outputBtn}
              onClick={handleCopy}
              title="Copy output"
              aria-label="Copy output to clipboard"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className={styles.outputBtn}
            onClick={onClear}
            title="Clear output"
            aria-label="Clear output"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      </div>

      {/* Content */}
      <div className={styles.outputContent}>
        {isActive && (
          <div className={styles.loadingRow}>
            <Spinner />
            <span>{status === 'loading' ? 'Loading runtime...' : 'Executing...'}</span>
          </div>
        )}

        {result?.stdout && (
          <pre className={styles.stdout}>{result.stdout}</pre>
        )}

        {result?.stderr && (
          <pre className={styles.stderr}>{result.stderr}</pre>
        )}

        {result?.error && (
          <pre className={styles.errorOutput}>{result.error}</pre>
        )}

        {result?.images && result.images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Output plot ${i + 1}`}
            className={styles.outputImage}
          />
        ))}
      </div>
    </div>
  );
}
