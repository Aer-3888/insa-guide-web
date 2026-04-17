/**
 * Option B: CodeBlock Wrapper - Render-time transformation
 *
 * Swizzled CodeBlock wrapper that intercepts code blocks at render time.
 * If the language is executable, renders CodeRunner instead of the
 * default Prism-highlighted CodeBlock.
 *
 * This is the safer approach for Docusaurus compatibility since it
 * uses the official swizzle wrapper pattern and does not modify the AST.
 *
 * To enable: run `npx docusaurus swizzle @docusaurus/theme-classic CodeBlock --wrap`
 * or simply place this file at src/theme/CodeBlock/index.tsx
 */
import React from 'react';
import type {WrapperProps} from '@docusaurus/types';
import CodeBlockOriginal from '@theme-original/CodeBlock';
import type CodeBlockType from '@theme/CodeBlock';
import CodeRunner from '@site/src/components/CodeRunner/CodeRunner';

type Props = WrapperProps<typeof CodeBlockType>;

/** Languages that CodeRunner can execute. */
const EXECUTABLE_LANGUAGES = new Set([
  'javascript',
  'js',
  'python',
  'py',
  'sql',
  'java',
  'c',
  'cpp',
  'r',
  'ocaml',
  'prolog',
]);

/**
 * Normalize a language identifier to lowercase, stripping the
 * `language-` prefix that Docusaurus/Prism sometimes adds.
 */
function normalizeLanguage(lang: string | undefined): string {
  if (!lang) return '';
  return lang.replace(/^language-/i, '').toLowerCase();
}

/**
 * Extract the raw code string from the CodeBlock children.
 * Docusaurus passes code as a string child or as children of a <pre><code>.
 */
function extractCode(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }

  // Handle React elements (e.g., <code> inside <pre>)
  if (React.isValidElement(children)) {
    const element = children as React.ReactElement<{children?: React.ReactNode}>;
    if (element.props.children) {
      return extractCode(element.props.children);
    }
  }

  // Handle arrays
  if (Array.isArray(children)) {
    return children.map(extractCode).join('');
  }

  return String(children ?? '');
}

export default function CodeBlockWrapper(props: Props): React.ReactNode {
  const propsRecord = props as unknown as Record<string, unknown>;
  const language = normalizeLanguage(
    (props.language ?? propsRecord.className) as string | undefined,
  );

  if (EXECUTABLE_LANGUAGES.has(language)) {
    const code = extractCode(props.children);

    return (
      <CodeRunner
        language={language}
        code={code}
        {...(props.metastring ? {metastring: props.metastring} : {})}
      />
    );
  }

  // Non-executable languages: render with the original Prism CodeBlock
  return <CodeBlockOriginal {...props} />;
}
