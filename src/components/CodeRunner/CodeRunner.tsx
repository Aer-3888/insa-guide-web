import {useState, useCallback} from 'react';
import type {ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import CodeBlock from '@theme-original/CodeBlock';
import {useRuntime} from '../runtimes/RuntimeContext';
import {usePageCode} from './PageCodeContext';
import type {ExecutionResult} from '../runtimes/types';
import styles from './CodeRunner.module.css';

interface CodeRunnerProps {
  readonly code: string;
  readonly language: string;
}

function RunIcon(): ReactNode {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function StopIcon(): ReactNode {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

function SpinnerIcon(): ReactNode {
  return (
    <svg
      className={styles.spinnerIcon}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

type LocalStatus = 'idle' | 'setup' | 'running' | 'done';

function CodeRunnerInner({code, language}: CodeRunnerProps): ReactNode {
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [localStatus, setLocalStatus] = useState<LocalStatus>('idle');
  const [setupCount, setSetupCount] = useState(0);
  const {execute, interrupt} = useRuntime(language);
  const {getPrecedingBlocks} = usePageCode(language, code);

  const handleRun = useCallback(async () => {
    setResult(null);

    const preceding = getPrecedingBlocks();
    if (preceding.length > 0) {
      setLocalStatus('setup');
      setSetupCount(preceding.length);
      for (const block of preceding) {
        await execute(block, {});
      }
    }

    setLocalStatus('running');
    const execResult = await execute(code, {});
    setResult(execResult);
    setLocalStatus('done');
  }, [execute, code, getPrecedingBlocks]);

  const handleStop = useCallback(() => {
    interrupt();
    setLocalStatus('idle');
  }, [interrupt]);

  const isActive = localStatus === 'setup' || localStatus === 'running';

  const buttonLabel = (() => {
    if (localStatus === 'setup') return `Preparation (${setupCount} blocs)...`;
    if (localStatus === 'running') return 'Execution...';
    return 'Executer';
  })();

  const buttonIcon = (() => {
    if (isActive) return <SpinnerIcon />;
    return <RunIcon />;
  })();

  return (
    <div className={styles.container}>
      <CodeBlock language={language}>{code}</CodeBlock>

      <div className={styles.toolbar}>
        {isActive ? (
          <button
            type="button"
            className={`${styles.runButton} ${styles.runButtonStop}`}
            onClick={handleStop}
            aria-label="Arreter"
          >
            <StopIcon />
            <span>{buttonLabel}</span>
          </button>
        ) : (
          <button
            type="button"
            className={styles.runButton}
            onClick={handleRun}
            aria-label="Executer"
          >
            {buttonIcon}
            <span>{buttonLabel}</span>
          </button>
        )}

        {result && (
          <span className={styles.timeBadge}>
            {formatTime(result.executionTime)}
          </span>
        )}
      </div>

      {(isActive || result) && (
        <div className={styles.output} role="region" aria-label="Execution output">
          {localStatus === 'setup' && (
            <div className={styles.loadingRow}>
              <SpinnerIcon />
              <span>Execution des {setupCount} bloc(s) precedent(s)...</span>
            </div>
          )}

          {localStatus === 'running' && (
            <div className={styles.loadingRow}>
              <SpinnerIcon />
              <span>Execution en cours...</span>
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

          {result?.images?.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Output ${i + 1}`}
              className={styles.outputImage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CodeRunner(props: CodeRunnerProps): ReactNode {
  return (
    <BrowserOnly
      fallback={
        <CodeBlock language={props.language}>{props.code}</CodeBlock>
      }
    >
      {() => <CodeRunnerInner {...props} />}
    </BrowserOnly>
  );
}
