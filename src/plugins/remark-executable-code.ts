/**
 * Option A: Remark Plugin - Build-time AST transformation
 *
 * Transforms fenced code blocks in supported languages into
 * <CodeRunner /> MDX JSX elements at build time.
 *
 * Unsupported languages are left as standard Prism code blocks.
 *
 * Compatible with Docusaurus 3.10, MDX v3, and unified/remark pipelines.
 */
import type {Plugin} from 'unified';
import type {Root, Code} from 'mdast';
import {visit} from 'unist-util-visit';

/** Languages that support execution via CodeRunner. */
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

/** Languages that must always remain static. */
const STATIC_LANGUAGES = new Set([
  'bash',
  'shell',
  'sh',
  'zsh',
  'arm',
  'asm',
  'assembly',
  'text',
  'txt',
  'markdown',
  'md',
  'json',
  'xml',
  'html',
  'css',
  'yaml',
  'yml',
  'toml',
  'ini',
  'dockerfile',
  'makefile',
]);

/**
 * Parse optional metadata from the code block's meta string.
 *
 * Supports two forms:
 *   ```python {stdin: "hello"}
 *   ```python stdin="hello"
 *
 * Returns a record of key-value pairs to pass as JSX attributes.
 */
function parseMeta(meta: string | null | undefined): Record<string, string> {
  if (!meta) return {};

  const result: Record<string, string> = {};

  // Match {key: "value", key2: "value2"} style
  const braceMatch = meta.match(/\{(.+)\}/);
  if (braceMatch) {
    const inner = braceMatch[1];
    const pairs = inner.match(/(\w+)\s*:\s*"([^"]*)"/g);
    if (pairs) {
      for (const pair of pairs) {
        const m = pair.match(/(\w+)\s*:\s*"([^"]*)"/);
        if (m) {
          result[m[1]] = m[2];
        }
      }
    }
    return result;
  }

  // Match key="value" style
  const attrPairs = meta.match(/(\w+)="([^"]*)"/g);
  if (attrPairs) {
    for (const pair of attrPairs) {
      const m = pair.match(/(\w+)="([^"]*)"/);
      if (m) {
        result[m[1]] = m[2];
      }
    }
  }

  return result;
}

/**
 * Escape a string for safe embedding in a JSX attribute value.
 * Handles backticks, double quotes, backslashes, and newlines.
 */
function escapeForJsxAttribute(raw: string): string {
  return raw
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '&quot;')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '&#36;');
}

/**
 * Build an mdxJsxAttribute node for MDX v3 AST.
 */
function jsxAttribute(name: string, value: string) {
  return {
    type: 'mdxJsxAttribute' as const,
    name,
    value,
  };
}

/**
 * The remark plugin function. Use it in docusaurus.config.ts:
 *
 *   import remarkExecutableCode from './src/plugins/remark-executable-code';
 *   // ...
 *   docs: { remarkPlugins: [remarkExecutableCode] }
 */
const remarkExecutableCode: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (index === undefined || !parent) return;

      const lang = (node.lang ?? '').toLowerCase();

      // Skip code blocks with no language or with a static language
      if (!lang || STATIC_LANGUAGES.has(lang) || !EXECUTABLE_LANGUAGES.has(lang)) {
        return;
      }

      const code = node.value;
      const meta = parseMeta(node.meta);

      // Build JSX attributes
      const attributes = [
        jsxAttribute('language', lang),
        jsxAttribute('code', escapeForJsxAttribute(code)),
      ];

      // Pass through any metadata as additional props
      for (const [key, value] of Object.entries(meta)) {
        attributes.push(jsxAttribute(key, escapeForJsxAttribute(value)));
      }

      // Replace the code node with an MDX JSX flow element
      const jsxNode = {
        type: 'mdxJsxFlowElement' as const,
        name: 'CodeRunner',
        attributes,
        children: [],
        data: {_mdxExplicitJsx: true},
      };

      // Splice the JSX node into the parent in place of the code node
      (parent.children as unknown[]).splice(index, 1, jsxNode);
    });
  };
};

export default remarkExecutableCode;
