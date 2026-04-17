import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode, ComponentType } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useRuntime } from '../runtimes/RuntimeContext';
import type { ExecutionResult } from '../runtimes/types';
import styles from './CodeRunner.module.css';

interface CodeRunnerProps {
  readonly code: string;
  readonly language: string;
  readonly stdin?: string;
  readonly editable?: boolean;
}

/** Lazily loaded child component bundle. */
interface ChildModules {
  readonly Editor: ComponentType<any>;
  readonly OutputPanel: ComponentType<any>;
  readonly RunButton: ComponentType<any>;
  readonly StdInPanel: ComponentType<any>;
}

function CodeRunnerInner({
  code: initialCode,
  language,
  stdin: initialStdin = '',
  editable = true,
}: CodeRunnerProps): ReactNode {
  const [editedCode, setEditedCode] = useState(initialCode);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [stdinVisible, setStdinVisible] = useState(initialStdin.length > 0);
  const [stdinValue, setStdinValue] = useState(initialStdin);
  const [children, setChildren] = useState<ChildModules | null>(null);

  // Use the real runtime hook from RuntimeContext
  const { status, info, execute, interrupt } = useRuntime(language);

  // Load child components once on mount.
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      import('./Editor'),
      import('./OutputPanel'),
      import('./RunButton'),
      import('./StdInPanel'),
    ]).then(([edMod, outMod, runMod, stdinMod]) => {
      if (cancelled) return;
      setChildren({
        Editor: edMod.default,
        OutputPanel: outMod.default,
        RunButton: runMod.default,
        StdInPanel: stdinMod.default,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRun = useCallback(async () => {
    const execResult = await execute(editedCode, { stdin: stdinValue });
    setResult(execResult);
  }, [execute, editedCode, stdinValue]);

  const handleStop = useCallback(() => {
    interrupt();
  }, [interrupt]);

  const handleReset = useCallback(() => {
    setEditedCode(initialCode);
    setResult(null);
  }, [initialCode]);

  const handleClearOutput = useCallback(() => {
    setResult(null);
  }, []);

  const handleStdinSubmit = useCallback((input: string) => {
    setStdinValue(input);
  }, []);

  const languageLabel = language.charAt(0).toUpperCase() + language.slice(1);

  return (
    <div className={styles.container}>
      {/* Editor area */}
      <div className={styles.editorWrapper}>
        {children ? (
          <children.Editor
            code={editedCode}
            language={language}
            onChange={setEditedCode}
            readOnly={!editable}
          />
        ) : (
          <pre className={styles.editorFallback}>{editedCode}</pre>
        )}
      </div>

      {/* Controls bar */}
      <div className={styles.controls}>
        <div className={styles.controlsLeft}>
          {children && (
            <children.RunButton
              onClick={handleRun}
              onStop={handleStop}
              status={status}
              runtimeInfo={info}
            />
          )}
          <span className={styles.languageBadge}>{languageLabel}</span>
        </div>
        <div className={styles.controlsRight}>
          <button
            type="button"
            className={styles.stdinToggle}
            onClick={() => setStdinVisible((v) => !v)}
            title="Toggle stdin panel"
            aria-label="Toggle standard input"
          >
            stdin
          </button>
          {editable && editedCode !== initialCode && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleReset}
              title="Reset to original code"
              aria-label="Reset code"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Stdin panel */}
      {children && (
        <children.StdInPanel
          visible={stdinVisible}
          onSubmit={handleStdinSubmit}
          defaultValue={initialStdin}
        />
      )}

      {/* Output area */}
      {children && (
        <children.OutputPanel
          result={result}
          status={status}
          onClear={handleClearOutput}
        />
      )}
    </div>
  );
}

/**
 * Main CodeRunner export.
 *
 * Wrapped in <BrowserOnly> so that CodeMirror (which requires DOM APIs)
 * is never evaluated during Docusaurus SSR / static build.
 */
export default function CodeRunner(props: CodeRunnerProps): ReactNode {
  return (
    <BrowserOnly fallback={<pre className={styles.editorFallback}>{props.code}</pre>}>
      {() => <CodeRunnerInner {...props} />}
    </BrowserOnly>
  );
}
