# Executable Code Blocks - Integration Guide

Two approaches are provided for making code blocks executable. Pick one.

## Option A: Remark Plugin (Build-time AST Transform)

The remark plugin transforms fenced code blocks at build time. It rewrites
the markdown AST so that supported-language code blocks become `<CodeRunner />`
JSX elements before React ever sees them.

### Setup

1. **Import the plugin** in `docusaurus.config.ts`:

```typescript
import remarkExecutableCode from './src/plugins/remark-executable-code';
```

2. **Add it to the docs preset** (and blog, if needed):

```typescript
presets: [
  [
    'classic',
    {
      docs: {
        sidebarPath: './sidebars.ts',
        remarkPlugins: [remarkExecutableCode],
        //               ^^^^^^^^^^^^^^^^^^^^
      },
      blog: {
        remarkPlugins: [remarkExecutableCode],  // optional
      },
      // ...
    },
  ],
],
```

If you also use `remark-math`, keep both:

```typescript
remarkPlugins: [remarkMath, remarkExecutableCode],
```

3. **Register the component** in `src/theme/MDXComponents.tsx` (already done):

```typescript
import MDXComponents from '@theme-original/MDXComponents';
import CodeRunner from '@site/src/components/CodeRunner/CodeRunner';

export default {
  ...MDXComponents,
  CodeRunner,
};
```

### How it works

- Walks every `code` node in the markdown AST using `unist-util-visit`
- If the language is in `EXECUTABLE_LANGUAGES`, replaces the node with:
  `{ type: 'mdxJsxFlowElement', name: 'CodeRunner', attributes: [...] }`
- Code content is escaped for safe JSX attribute embedding
- Metadata like `{stdin: "hello"}` is parsed and forwarded as props

### Pros / Cons

| Pro | Con |
|-----|-----|
| Runs once at build time (zero runtime cost) | AST manipulation can break with MDX/Docusaurus upgrades |
| Full control over the transformed output | Harder to debug (build errors are opaque) |
| Works even in plain `.md` files | Must escape code content carefully |

---

## Option B: CodeBlock Wrapper (Render-time Component Swap)

The CodeBlock wrapper intercepts Docusaurus's `<CodeBlock>` at render time
and delegates executable languages to `<CodeRunner>`.

### Setup

1. **Place the wrapper** at `src/theme/CodeBlock/index.tsx` (already done).

   That is it. Docusaurus automatically picks up theme component overrides
   from `src/theme/`. No config changes are needed.

2. If you want to also use `<CodeRunner>` directly in MDX, keep the
   `MDXComponents.tsx` registration from Option A.

### How it works

- Docusaurus renders every fenced code block through `@theme/CodeBlock`
- Our wrapper checks if the language is in `EXECUTABLE_LANGUAGES`
- If yes: extracts the raw code string and renders `<CodeRunner>`
- If no: passes through to `@theme-original/CodeBlock` (Prism highlighting)

### Pros / Cons

| Pro | Con |
|-----|-----|
| Uses official Docusaurus swizzle pattern | Runs on every page render (minimal overhead) |
| Easy to debug (standard React) | Cannot transform content in `.md` files that skip React |
| Resilient to MDX version changes | Slightly less control over the HTML output |

---

## Choosing Between Options

**Recommended: Option B** (CodeBlock wrapper) for most cases because:

- It follows Docusaurus conventions
- It is easier to maintain and debug
- It does not require config changes

Use **Option A** (remark plugin) if you need:

- Zero-cost build-time transformation
- To process raw `.md` files that are not rendered through React
- Fine-grained control over the AST output

**Using both simultaneously** is possible but not recommended, as they
would both try to handle the same code blocks. If you do use both, the
remark plugin runs first and the CodeBlock wrapper would never see the
transformed blocks (they are already `<CodeRunner>` elements).

---

## Supported Languages

Executable (routed to CodeRunner):
`javascript`, `js`, `python`, `py`, `sql`, `java`, `c`, `cpp`, `r`, `ocaml`, `prolog`

Static (always rendered with Prism):
`bash`, `shell`, `sh`, `arm`, `asm`, `text`, `markdown`, `json`, `xml`,
`html`, `css`, `yaml`, `yml`, and any unlisted language.
