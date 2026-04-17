import { useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { RuntimeStatus, RuntimeInfo } from '../runtimes/types';
import styles from './CodeRunner.module.css';

interface RunButtonProps {
  readonly onClick: () => void;
  readonly onStop: () => void;
  readonly status: RuntimeStatus;
  readonly runtimeInfo?: RuntimeInfo;
}

function PlayIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function StopIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

function SpinnerIcon(): ReactNode {
  return (
    <svg
      className={styles.spinnerIcon}
      width="16"
      height="16"
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

export default function RunButton({
  onClick,
  onStop,
  status,
  runtimeInfo,
}: RunButtonProps): ReactNode {
  const isExecuting = status === 'executing';
  const isLoading = status === 'loading';
  const isRunnable = status === 'ready' || status === 'unloaded';

  const handleClick = useCallback(() => {
    if (isExecuting) {
      onStop();
    } else if (isRunnable) {
      onClick();
    }
  }, [isExecuting, isRunnable, onClick, onStop]);

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isExecuting) {
          onStop();
        } else if (isRunnable) {
          onClick();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExecuting, isRunnable, onClick, onStop]);

  const label = (() => {
    if (isLoading) {
      const langName = runtimeInfo?.displayName || runtimeInfo?.language || 'runtime';
      const size = runtimeInfo?.bundleSize || '...';
      return `Loading ${langName} (${size})...`;
    }
    if (isExecuting) return 'Stop';
    return 'Run';
  })();

  const icon = (() => {
    if (isLoading) return <SpinnerIcon />;
    if (isExecuting) return <StopIcon />;
    return <PlayIcon />;
  })();

  const buttonClass = [
    styles.runButton,
    isExecuting ? styles.runButtonStop : '',
    isLoading ? styles.runButtonLoading : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={handleClick}
      disabled={isLoading}
      title={`${label} (Ctrl+Enter)`}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
