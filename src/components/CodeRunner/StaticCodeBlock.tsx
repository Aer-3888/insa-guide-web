/**
 * StaticCodeBlock - Fallback for non-executable code blocks.
 *
 * Wraps the Docusaurus default CodeBlock with:
 * - A language badge in the header
 * - A "Copy" button
 * - No "Run" button
 *
 * Can be used directly in MDX: <StaticCodeBlock language="bash" code="ls -la" />
 */
import {useCallback, useState} from 'react';
import type {ReactNode} from 'react';
import CodeBlock from '@theme/CodeBlock';

export interface StaticCodeBlockProps {
  /** The programming language for syntax highlighting. */
  readonly language: string;
  /** The source code to display. */
  readonly code: string;
  /** Optional title for the code block. */
  readonly title?: string;
  /** Whether to show line numbers. */
  readonly showLineNumbers?: boolean;
}

/**
 * Map language identifiers to human-readable display names.
 */
const LANGUAGE_NAMES: Readonly<Record<string, string>> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  py: 'Python',
  python: 'Python',
  rb: 'Ruby',
  ruby: 'Ruby',
  sql: 'SQL',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  r: 'R',
  ocaml: 'OCaml',
  prolog: 'Prolog',
  bash: 'Bash',
  shell: 'Shell',
  sh: 'Shell',
  json: 'JSON',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  yaml: 'YAML',
  yml: 'YAML',
  arm: 'ARM Assembly',
  asm: 'Assembly',
  markdown: 'Markdown',
  md: 'Markdown',
  text: 'Plain Text',
  txt: 'Plain Text',
  dockerfile: 'Dockerfile',
  makefile: 'Makefile',
};

function displayLanguageName(lang: string): string {
  return LANGUAGE_NAMES[lang.toLowerCase()] ?? lang.toUpperCase();
}

export default function StaticCodeBlock({
  language,
  code,
  title,
  showLineNumbers = false,
}: StaticCodeBlockProps): ReactNode {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="static-code-block" data-language={language}>
      <div className="static-code-block__header">
        <span className="static-code-block__language-badge">
          {displayLanguageName(language)}
        </span>
        {title && (
          <span className="static-code-block__title">{title}</span>
        )}
        <button
          type="button"
          className="static-code-block__copy-button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy code to clipboard'}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <CodeBlock language={language} showLineNumbers={showLineNumbers}>
        {code}
      </CodeBlock>
    </div>
  );
}
