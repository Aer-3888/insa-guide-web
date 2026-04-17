import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import styles from './CodeRunner.module.css';

interface StdInPanelProps {
  readonly visible: boolean;
  readonly onSubmit: (input: string) => void;
  readonly defaultValue?: string;
}

export default function StdInPanel({
  visible,
  onSubmit,
  defaultValue = '',
}: StdInPanelProps): ReactNode {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = useCallback(() => {
    onSubmit(value);
  }, [onSubmit, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  if (!visible) return null;

  return (
    <div className={styles.stdinPanel} role="region" aria-label="Program input">
      <label className={styles.stdinLabel} htmlFor="stdin-input">
        Enter program input (one value per line)
      </label>
      <textarea
        id="stdin-input"
        className={styles.stdinTextarea}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        placeholder="stdin..."
        spellCheck={false}
      />
      <button
        type="button"
        className={styles.stdinSubmit}
        onClick={handleSubmit}
      >
        Submit Input
      </button>
    </div>
  );
}
