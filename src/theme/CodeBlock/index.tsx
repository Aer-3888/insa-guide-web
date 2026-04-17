import React from 'react';
import type {WrapperProps} from '@docusaurus/types';
import CodeBlockOriginal from '@theme-original/CodeBlock';
import type CodeBlockType from '@theme/CodeBlock';
import CodeRunner from '@site/src/components/CodeRunner/CodeRunner';
import {isExecutableLanguage, resolveLanguage} from '@site/src/components/runtimes/registry';

type Props = WrapperProps<typeof CodeBlockType>;

function normalizeLanguage(lang: string | undefined): string {
  if (!lang) return '';
  return lang.replace(/^language-/i, '').toLowerCase();
}

function extractCode(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (React.isValidElement(children)) {
    const element = children as React.ReactElement<{children?: React.ReactNode}>;
    if (element.props.children) return extractCode(element.props.children);
  }
  if (Array.isArray(children)) return children.map(extractCode).join('');
  return String(children ?? '');
}

export default function CodeBlockWrapper(props: Props): React.ReactNode {
  const propsRecord = props as unknown as Record<string, unknown>;
  const language = normalizeLanguage(
    (props.language ?? propsRecord.className) as string | undefined,
  );

  if (isExecutableLanguage(language)) {
    const code = extractCode(props.children);
    return <CodeRunner language={resolveLanguage(language)} code={code} />;
  }

  return <CodeBlockOriginal {...props} />;
}
