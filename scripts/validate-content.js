#!/usr/bin/env node

/**
 * validate-content.js
 *
 * Validates synced markdown files in the Docusaurus docs/ directory:
 *   1. Every .md file has valid YAML frontmatter (title + sidebar_position)
 *   2. No broken internal links between markdown files
 *
 * Usage:
 *   node scripts/validate-content.js
 *
 * Exit code 1 if any errors are found.
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(PROJECT_ROOT, "docs");

// Files that are expected to have non-standard frontmatter (e.g. pre-existing
// Docusaurus pages that use slug instead of title).
const FRONTMATTER_SKIP_PATTERNS = [
  /\/index\.md$/,
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively collect all .md files under a directory.
 */
function collectMarkdownFiles(dir) {
  const results = [];

  function walk(current) {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results.sort();
}

/**
 * Validate that a file has proper YAML frontmatter with title and sidebar_position.
 * Returns an array of error strings (empty = valid).
 */
function validateFrontmatter(filePath, content) {
  const errors = [];

  // Skip files that match known patterns for non-standard frontmatter
  const relPath = path.relative(DOCS_DIR, filePath).replace(/\\/g, "/");
  for (const pattern of FRONTMATTER_SKIP_PATTERNS) {
    if (pattern.test(relPath)) return errors;
  }

  if (!/^---\s*\n/.test(content)) {
    errors.push("Missing frontmatter block");
    return errors;
  }

  const endIndex = content.indexOf("\n---", 3);
  if (endIndex === -1) {
    errors.push("Frontmatter block is not closed (missing closing ---)");
    return errors;
  }

  const frontmatterBlock = content.substring(4, endIndex);

  if (!/^title:\s*.+/m.test(frontmatterBlock)) {
    errors.push("Frontmatter missing 'title' field");
  }

  if (!/^sidebar_position:\s*\d+/m.test(frontmatterBlock)) {
    errors.push("Frontmatter missing or invalid 'sidebar_position' field");
  }

  return errors;
}

/**
 * Extract all internal markdown links from content, skipping those inside
 * fenced code blocks (``` ... ```) to avoid false positives.
 * Returns an array of { text, href, line } objects.
 */
function extractInternalLinks(content) {
  const links = [];
  const lines = content.split("\n");
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    // Toggle code block state
    if (/^```/.test(line.trimStart())) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // Also skip inline code containing link-like syntax
    // We extract links only from non-code portions of the line
    const regex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
      const href = match[2];

      // Skip external links, anchors, images, non-md resources
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        /\.(png|jpg|jpeg|gif|svg|pdf|zip|tar|gz|ipynb|csv|py|js|java|c|s|circ|mem|html|xml|json|sh|pl|hs|ml|r|sql|txt)$/i.test(href)
      ) {
        continue;
      }

      // Skip links that look like regex character classes or code artifacts
      // e.g. [1-9](s-d-2), [args.command](args)
      if (/^\d/.test(match[1]) && !/\.md/.test(href)) continue;
      if (match[1].includes(".") && !href.includes("/") && !href.endsWith(".md")) continue;

      links.push({ text: match[1], href, line: lineNum });
    }
  }

  return links;
}

/**
 * Build a set of all known file paths and directories (relative to docs dir).
 */
function buildKnownPathsSet(files) {
  const known = new Set();
  const knownDirs = new Set();

  for (const f of files) {
    const rel = path.relative(DOCS_DIR, f).replace(/\\/g, "/");
    known.add(rel);
    // Also add without .md extension (Docusaurus style)
    known.add(rel.replace(/\.md$/, ""));

    // Register all parent directories as valid link targets
    // (Docusaurus auto-generates category pages for directories)
    let dir = path.dirname(rel);
    while (dir && dir !== ".") {
      knownDirs.add(dir);
      dir = path.dirname(dir);
    }
  }

  return { known, knownDirs };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log(`Validating docs in: ${DOCS_DIR}`);
  console.log("");

  if (!fs.existsSync(DOCS_DIR)) {
    console.error("ERROR: docs/ directory not found. Run sync-content.js first.");
    process.exit(1);
  }

  const files = collectMarkdownFiles(DOCS_DIR);
  if (files.length === 0) {
    console.error("ERROR: No markdown files found in docs/.");
    process.exit(1);
  }

  const { known: knownPaths, knownDirs } = buildKnownPathsSet(files);

  let totalFiles = 0;
  let totalErrors = 0;
  let frontmatterErrors = 0;
  let linkErrors = 0;

  for (const filePath of files) {
    totalFiles++;
    const relPath = path.relative(DOCS_DIR, filePath).replace(/\\/g, "/");
    const content = fs.readFileSync(filePath, "utf-8");
    const fileErrors = [];

    // --- Frontmatter validation ---
    const fmErrors = validateFrontmatter(filePath, content);
    for (const err of fmErrors) {
      fileErrors.push(`  FRONTMATTER: ${err}`);
      frontmatterErrors++;
    }

    // --- Internal link validation ---
    const links = extractInternalLinks(content);
    for (const link of links) {
      let targetPath = link.href.split("#")[0];

      // Remove trailing slashes
      targetPath = targetPath.replace(/\/$/, "");

      if (!targetPath) continue; // anchor-only link after stripping

      // Handle absolute paths (starting with /)
      if (targetPath.startsWith("/")) {
        targetPath = targetPath.substring(1);
      } else {
        // Resolve relative to current file's directory
        const fileDir = path.dirname(relPath);
        targetPath = path.posix.normalize(path.posix.join(fileDir, targetPath));
      }

      // Check if the target exists as a file or directory
      const existsAsFile =
        knownPaths.has(targetPath) ||
        knownPaths.has(targetPath + ".md") ||
        knownPaths.has(targetPath.replace(/\.md$/, ""));
      const existsAsDir = knownDirs.has(targetPath);

      if (!existsAsFile && !existsAsDir) {
        fileErrors.push(
          `  BROKEN LINK (line ${link.line}): [${link.text}](${link.href}) -> ${targetPath}`
        );
        linkErrors++;
      }
    }

    if (fileErrors.length > 0) {
      console.log(`${relPath}:`);
      for (const err of fileErrors) {
        console.log(err);
      }
      totalErrors += fileErrors.length;
    }
  }

  // -----------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------
  console.log("");
  console.log("=== Validation Summary ===");
  console.log(`${totalFiles} files checked`);
  console.log(`${frontmatterErrors} frontmatter errors`);
  console.log(`${linkErrors} broken links`);
  console.log(`${totalFiles} files synced, ${totalErrors} errors`);

  if (totalErrors > 0) {
    process.exit(1);
  } else {
    console.log("All files valid!");
  }
}

main();
