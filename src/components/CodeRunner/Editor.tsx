import { useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';

interface EditorProps {
  readonly code: string;
  readonly language: string;
  readonly onChange: (code: string) => void;
  readonly readOnly?: boolean;
}

/**
 * Returns the CodeMirror language extension for a given language string.
 * Dynamic imports keep unused language grammars out of the initial bundle.
 */
async function loadLanguageExtension(language: string) {
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'js': {
      const { javascript } = await import('@codemirror/lang-javascript');
      return javascript();
    }
    case 'python':
    case 'py': {
      const { python } = await import('@codemirror/lang-python');
      return python();
    }
    case 'sql': {
      const { sql } = await import('@codemirror/lang-sql');
      return sql();
    }
    case 'java': {
      const { java } = await import('@codemirror/lang-java');
      return java();
    }
    case 'c':
    case 'cpp':
    case 'c++': {
      const { cpp } = await import('@codemirror/lang-cpp');
      return cpp();
    }
    default:
      return null;
  }
}

/** Lightweight theme overrides to make the editor fill its container. */
const containerTheme = EditorView.theme({
  '&': {
    minHeight: '100px',
    maxHeight: '400px',
    width: '100%',
    fontSize: '14px',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
});

export default function Editor({
  code,
  language,
  onChange,
  readOnly = false,
}: EditorProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  // Keep callback ref current without recreating the editor.
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const createView = useCallback(
    async (container: HTMLDivElement) => {
      const langExtension = await loadLanguageExtension(language);

      const extensions = [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        indentOnInput(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        oneDark,
        containerTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ];

      if (langExtension) {
        extensions.push(langExtension);
      }

      if (readOnly) {
        extensions.push(EditorState.readOnly.of(true));
      }

      const state = EditorState.create({
        doc: code,
        extensions,
      });

      return new EditorView({ state, parent: container });
    },
    // Recreate the view when language or readOnly changes.
    // `code` is intentionally excluded -- we update it via dispatch below.
    [language, readOnly],
  );

  // Mount / remount the editor.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let view: EditorView | null = null;

    createView(container).then((v) => {
      if (cancelled) {
        v.destroy();
        return;
      }
      view = v;
      viewRef.current = v;
    });

    return () => {
      cancelled = true;
      if (view) {
        view.destroy();
      }
      viewRef.current = null;
    };
  }, [createView]);

  // Sync external `code` prop into the editor when it changes from outside
  // (e.g. "Reset" button restoring original code).
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== code) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: code },
      });
    }
  }, [code]);

  return <div ref={containerRef} />;
}
