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

function CodeRunnerInner({code, language}: CodeRunnerProps): ReactNode {
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [setupInfo, setSetupInfo] = useState<string | null>(null);
  const {status, info, execute, interrupt} = useRuntime(language);
  const {getPrecedingBlocks} = usePageCode(language, code);

  const isExecuting = status === 'executing';
  const isLoading = status === 'loading';
  const isActive = isLoading || isExecuting;

  const handleRun = useCallback(async () => {
    setResult(null);
    setSetupInfo(null);

    const preceding = getPrecedingBlocks();
    if (preceding.length > 0) {
      setSetupInfo(`Execution des ${preceding.length} bloc(s) precedent(s)...`);
      for (const block of preceding) {
        await execute(block, {});
      }
      setSetupInfo(null);
    }

    const execResult = await execute(code, {});
    setResult(execResult);
  }, [execute, code, getPrecedingBlocks]);

  const handleStop = useCallback(() => {
    interrupt();
  }, [interrupt]);

  const buttonLabel = (() => {
    if (isLoading) {
      const name = info?.displayName || language;
      return `Chargement ${name}...`;
    }
    if (isExecuting) return 'Arreter';
    return 'Executer';
  })();

  const buttonIcon = (() => {
    if (isLoading) return <SpinnerIcon />;
    if (isExecuting) return <StopIcon />;
    return <RunIcon />;
  })();

  return (
    <div className={styles.container}>
      <CodeBlock language={language}>{code}</CodeBlock>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={[
            styles.runButton,
            isExecuting ? styles.runButtonStop : '',
            isLoading ? styles.runButtonLoading : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={isExecuting ? handleStop : handleRun}
          disabled={isLoading}
          aria-label={buttonLabel}
        >
          {buttonIcon}
          <span>{buttonLabel}</span>
        </button>

        {result && (
          <span className={styles.timeBadge}>
            {formatTime(result.executionTime)}
          </span>
        )}
      </div>

      {(isActive || setupInfo || result) && (
        <div className={styles.output} role="region" aria-label="Execution output">
          {setupInfo && (
            <div className={styles.loadingRow}>
              <SpinnerIcon />
              <span>{setupInfo}</span>
            </div>
          )}

          {isActive && !setupInfo && (
            <div className={styles.loadingRow}>
              <SpinnerIcon />
              <span>
                {isLoading ? 'Chargement du runtime...' : 'Execution en cours...'}
              </span>
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
