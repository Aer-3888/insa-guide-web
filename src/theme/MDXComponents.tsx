/**
 * MDX Components override for Docusaurus.
 *
 * Registers the CodeRunner component so it can be used directly in MDX
 * files (e.g., when the remark plugin generates <CodeRunner /> elements).
 *
 * Required for Option A (remark plugin). Also useful for manually placing
 * <CodeRunner /> in any MDX page.
 */
import MDXComponents from '@theme-original/MDXComponents';
import CodeRunner from '@site/src/components/CodeRunner/CodeRunner';
import StaticCodeBlock from '@site/src/components/CodeRunner/StaticCodeBlock';

export default {
  ...MDXComponents,
  CodeRunner,
  StaticCodeBlock,
};
