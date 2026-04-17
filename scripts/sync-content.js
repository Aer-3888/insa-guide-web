#!/usr/bin/env node

/**
 * sync-content.js
 *
 * Copies markdown files from the Insa-Study-Guide source repository into the
 * Docusaurus docs/ directory, adding frontmatter, normalizing filenames,
 * fixing internal links, and generating a course manifest (courses.json).
 *
 * Usage:
 *   SOURCE_REPO=/path/to/source node scripts/sync-content.js
 *
 * Default source: /mnt/c/Users/theop/Documents/Project/Insa-Study-Guide
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SOURCE_REPO =
  process.env.SOURCE_REPO ||
  "/mnt/c/Users/theop/Documents/Project/Insa-Study-Guide";
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(PROJECT_ROOT, "docs");
const STATIC_DIR = path.join(PROJECT_ROOT, "static");
const SEMESTERS = ["S5", "S6"];

// Sections we copy directly from <Course>/<section>/*.md
const CONTENT_SECTIONS = ["guide", "exercises", "exam-prep"];

// ---------------------------------------------------------------------------
// Accent normalization map
// ---------------------------------------------------------------------------

const ACCENT_MAP = {
  "\u00e0": "a", "\u00e1": "a", "\u00e2": "a", "\u00e3": "a", "\u00e4": "a",
  "\u00e5": "a", "\u00e6": "ae",
  "\u00e7": "c",
  "\u00e8": "e", "\u00e9": "e", "\u00ea": "e", "\u00eb": "e",
  "\u00ec": "i", "\u00ed": "i", "\u00ee": "i", "\u00ef": "i",
  "\u00f0": "d",
  "\u00f1": "n",
  "\u00f2": "o", "\u00f3": "o", "\u00f4": "o", "\u00f5": "o", "\u00f6": "o",
  "\u00f8": "o",
  "\u00f9": "u", "\u00fa": "u", "\u00fb": "u", "\u00fc": "u",
  "\u00fd": "y", "\u00ff": "y",
  "\u00c0": "a", "\u00c1": "a", "\u00c2": "a", "\u00c3": "a", "\u00c4": "a",
  "\u00c5": "a", "\u00c6": "ae",
  "\u00c7": "c",
  "\u00c8": "e", "\u00c9": "e", "\u00ca": "e", "\u00cb": "e",
  "\u00cc": "i", "\u00cd": "i", "\u00ce": "i", "\u00cf": "i",
  "\u00d0": "d",
  "\u00d1": "n",
  "\u00d2": "o", "\u00d3": "o", "\u00d4": "o", "\u00d5": "o", "\u00d6": "o",
  "\u00d8": "o",
  "\u00d9": "u", "\u00da": "u", "\u00db": "u", "\u00dc": "u",
  "\u00dd": "y",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a filename: strip accents, lowercase, replace spaces with hyphens,
 * collapse consecutive hyphens, and strip leading/trailing hyphens.
 */
function normalizeFilename(name) {
  let result = "";
  for (const ch of name) {
    result += ACCENT_MAP[ch] || ch;
  }
  return result
    .toLowerCase()
    .replace(/[^a-z0-9.\-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Read a file as UTF-8. Returns null on failure.
 */
function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error(`  [WARN] Cannot read ${filePath}: ${err.message}`);
    return null;
  }
}

/**
 * Recursively create a directory.
 */
function mkdirSafe(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Returns true when the content already starts with YAML frontmatter.
 */
function hasFrontmatter(content) {
  return /^---\s*\n/.test(content);
}

/**
 * Extract the first H1 heading from markdown content, or return a fallback.
 */
function extractTitle(content, fallback) {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1]
      .replace(/[`*_]/g, "")
      .trim();
  }
  return fallback;
}

/**
 * Extract a human-readable course title from the guide/README.md H1 heading.
 * Falls back to the directory name with underscores replaced by spaces.
 */
function extractCourseTitle(courseDir, courseDirName) {
  const readmePath = path.join(courseDir, "guide", "README.md");
  const content = readFileSafe(readmePath);
  if (content !== null) {
    const title = extractTitle(content, null);
    if (title) {
      // Clean up: "ADFD -- Analyse de Donnees..." -> full title kept
      return title;
    }
  }
  return courseDirName.replace(/_/g, " ");
}

/**
 * Derive a numeric sidebar_position from a filename.
 * - Files starting with digits (01-foo, 02-bar) use that number.
 * - tp<N> patterns extract N.
 * - README files always get position 0.
 * - Everything else falls back to the provided index.
 */
function deriveSidebarPosition(filename, index) {
  const lower = filename.toLowerCase();
  if (lower === "readme.md") return 0;

  // Match leading digits: 01-preprocessing.md -> 1
  const leadingDigits = lower.match(/^(\d+)/);
  if (leadingDigits) return parseInt(leadingDigits[1], 10);

  // Match tp<N>: tp3-solution.md -> 3
  const tpMatch = lower.match(/tp(\d+)/);
  if (tpMatch) return parseInt(tpMatch[1], 10);

  // Match exam-<year>: exam-2023.md -> use index to keep it reasonable
  return index + 1;
}

/**
 * Add YAML frontmatter to markdown content.
 */
function addFrontmatter(content, title, sidebarPosition) {
  // Escape double quotes in title for YAML
  const safeTitle = title.replace(/"/g, '\\"');
  const frontmatter =
    `---\ntitle: "${safeTitle}"\nsidebar_position: ${sidebarPosition}\n---\n\n`;
  return frontmatter + content;
}

/**
 * Build a mapping of original filenames to their normalized Docusaurus paths.
 * This is accumulated globally so that link-fixing can reference it.
 *
 * Key: normalized relative path from source root (e.g. S5/ADFD/guide/01-preprocessing.md)
 * Value: normalized relative path in docs (e.g. S5/ADFD/guide/01-preprocessing.md)
 */
const fileMapping = new Map();

/**
 * Register a source-to-dest filename mapping for link resolution.
 * @param {string} sourceRelative - relative path from source root
 * @param {string} destRelative   - relative path from docs root
 */
function registerMapping(sourceRelative, destRelative) {
  fileMapping.set(
    sourceRelative.replace(/\\/g, "/"),
    destRelative.replace(/\\/g, "/")
  );
}

/**
 * Fix internal markdown links.
 * Rewrites [text](relative/path.md) links to point to correct Docusaurus paths.
 *
 * @param {string} content        - markdown content
 * @param {string} sourceFilePath - absolute path of the source file
 * @returns {string} content with rewritten links
 */
function fixInternalLinks(content, sourceFilePath) {
  // Match markdown links: [text](path) and [text](path.md)
  return content.replace(
    /\[([^\]]*)\]\(([^)]+)\)/g,
    (match, text, href) => {
      // Skip external links, anchors, and non-markdown resources
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        /\.(png|jpg|jpeg|gif|svg|pdf|zip|tar|gz|ipynb|csv|py|js|java|c|s|circ|mem)$/i.test(href)
      ) {
        return match;
      }

      // Resolve the absolute path of the linked file relative to source file
      const sourceDir = path.dirname(sourceFilePath);
      const targetAbsolute = path.resolve(sourceDir, href.split("#")[0]);
      const anchor = href.includes("#") ? "#" + href.split("#")[1] : "";

      // Compute the relative path from source root
      const sourceRoot = SOURCE_REPO;
      const targetRelative = path
        .relative(sourceRoot, targetAbsolute)
        .replace(/\\/g, "/");

      // Look up in our mapping
      const mapped = fileMapping.get(targetRelative);
      if (mapped) {
        // Compute the Docusaurus path (strip .md for Docusaurus links)
        const docPath = "/" + mapped.replace(/\.md$/, "");
        return `[${text}](${docPath}${anchor})`;
      }

      // If not found in mapping, try normalizing the filename portion
      const normalizedHref = href
        .split("/")
        .map((segment, i, arr) => {
          if (i === arr.length - 1) return normalizeFilename(segment);
          return segment;
        })
        .join("/");

      return `[${text}](${normalizedHref}${anchor})`;
    }
  );
}

// ---------------------------------------------------------------------------
// Core sync logic
// ---------------------------------------------------------------------------

/**
 * Sync a single markdown file from source to destination.
 * Returns the normalized destination filename on success, null on failure.
 */
function syncFile(sourcePath, destDir, originalFilename, index) {
  const content = readFileSafe(sourcePath);
  if (content === null) return null;

  const normalizedName = normalizeFilename(originalFilename);
  const destPath = path.join(destDir, normalizedName);

  const title = extractTitle(content, normalizedName.replace(/\.md$/, ""));
  const sidebarPos = deriveSidebarPosition(originalFilename, index);

  let processed = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!hasFrontmatter(processed)) {
    processed = addFrontmatter(processed, title, sidebarPos);
  }

  mkdirSafe(destDir);
  fs.writeFileSync(destPath, processed, "utf-8");
  return normalizedName;
}

/**
 * Collect all .md files from a directory, sorted alphabetically.
 */
function listMarkdownFiles(dir) {
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort();
  } catch {
    return [];
  }
}

/**
 * List subdirectories of a directory.
 */
function listSubdirs(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log(`Source repo: ${SOURCE_REPO}`);
  console.log(`Docs dir:   ${DOCS_DIR}`);
  console.log("");

  if (!fs.existsSync(SOURCE_REPO)) {
    console.error(`ERROR: Source repo not found at ${SOURCE_REPO}`);
    console.error("Set SOURCE_REPO environment variable to the correct path.");
    process.exit(1);
  }

  const manifest = { semesters: [] };
  let totalFiles = 0;
  let totalErrors = 0;

  // -----------------------------------------------------------------------
  // Pass 1: Build the file mapping (so link-fixing can look up targets)
  // -----------------------------------------------------------------------
  for (const semester of SEMESTERS) {
    const semesterDir = path.join(SOURCE_REPO, semester);
    if (!fs.existsSync(semesterDir)) continue;

    const courses = listSubdirs(semesterDir);
    for (const course of courses) {
      const courseDir = path.join(semesterDir, course);

      // Content sections: guide, exercises, exam-prep
      for (const section of CONTENT_SECTIONS) {
        const sectionDir = path.join(courseDir, section);
        const files = listMarkdownFiles(sectionDir);
        for (const file of files) {
          const sourceRel = path.join(semester, course, section, file);
          const normalizedName = normalizeFilename(file);
          const destRel = path.join(semester, course, section, normalizedName);
          registerMapping(
            sourceRel.replace(/\\/g, "/"),
            destRel.replace(/\\/g, "/")
          );
        }
      }

      // TP READMEs: data/moodle/tp/<tpName>/README.md -> tp/<tpName>.md
      const tpBaseDir = path.join(courseDir, "data", "moodle", "tp");
      const tpDirs = listSubdirs(tpBaseDir);
      for (const tpName of tpDirs) {
        const readmePath = path.join(tpBaseDir, tpName, "README.md");
        if (fs.existsSync(readmePath)) {
          const sourceRel = path.join(
            semester, course, "data", "moodle", "tp", tpName, "README.md"
          );
          const normalizedTpName = normalizeFilename(tpName) + ".md";
          const destRel = path.join(semester, course, "tp", normalizedTpName);
          registerMapping(
            sourceRel.replace(/\\/g, "/"),
            destRel.replace(/\\/g, "/")
          );
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // Pass 2: Copy files, add frontmatter, fix links
  // -----------------------------------------------------------------------
  for (const semester of SEMESTERS) {
    const semesterDir = path.join(SOURCE_REPO, semester);
    if (!fs.existsSync(semesterDir)) {
      console.log(`[SKIP] ${semester}: directory not found`);
      continue;
    }

    const semesterManifest = { id: semester, courses: [] };
    const courses = listSubdirs(semesterDir);

    for (const course of courses) {
      const courseDir = path.join(semesterDir, course);
      const courseTitle = extractCourseTitle(courseDir, course);
      const courseManifest = {
        id: course,
        title: courseTitle,
        sections: {},
      };
      let courseFileCount = 0;

      // --- Content sections: guide, exercises, exam-prep ---
      for (const section of CONTENT_SECTIONS) {
        const sectionDir = path.join(courseDir, section);
        const destSectionDir = path.join(DOCS_DIR, semester, course, section);
        const files = listMarkdownFiles(sectionDir);
        const sectionFiles = [];

        files.forEach((file, index) => {
          const sourcePath = path.join(sectionDir, file);
          const result = syncFile(sourcePath, destSectionDir, file, index);
          if (result !== null) {
            sectionFiles.push(result);
            courseFileCount++;

            // Now fix internal links in the written file
            const destPath = path.join(destSectionDir, result);
            const content = readFileSafe(destPath);
            if (content !== null) {
              const fixed = fixInternalLinks(content, sourcePath);
              if (fixed !== content) {
                fs.writeFileSync(destPath, fixed, "utf-8");
              }
            }
          } else {
            totalErrors++;
          }
        });

        if (sectionFiles.length > 0) {
          courseManifest.sections[section] = sectionFiles;
        }
      }

      // --- TP READMEs: data/moodle/tp/<tpName>/README.md ---
      const tpBaseDir = path.join(courseDir, "data", "moodle", "tp");
      const tpDirs = listSubdirs(tpBaseDir);
      const tpDestDir = path.join(DOCS_DIR, semester, course, "tp");
      const tpFiles = [];

      tpDirs.forEach((tpName, index) => {
        const readmePath = path.join(tpBaseDir, tpName, "README.md");
        if (!fs.existsSync(readmePath)) return;

        const content = readFileSafe(readmePath);
        if (content === null) {
          totalErrors++;
          return;
        }

        const normalizedTpName = normalizeFilename(tpName) + ".md";
        const destPath = path.join(tpDestDir, normalizedTpName);

        const title = extractTitle(content, tpName.replace(/_/g, " "));
        const sidebarPos = deriveSidebarPosition(tpName, index);

        let processed = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        if (!hasFrontmatter(processed)) {
          processed = addFrontmatter(processed, title, sidebarPos);
        }

        processed = fixInternalLinks(processed, readmePath);

        mkdirSafe(tpDestDir);
        fs.writeFileSync(destPath, processed, "utf-8");
        tpFiles.push(normalizedTpName);
        courseFileCount++;
      });

      if (tpFiles.length > 0) {
        courseManifest.sections["tp"] = tpFiles;
      }

      // --- Generate index.md for section dirs that lack readme.md ---
      const sectionLabels = {
        guide: "Guide",
        exercises: "Exercices",
        "exam-prep": "Preparation Examen",
        tp: "TP (Enonces)",
      };
      const allSectionDirs = [...CONTENT_SECTIONS, "tp"];
      for (const section of allSectionDirs) {
        const sectionDestDir = path.join(DOCS_DIR, semester, course, section);
        if (!fs.existsSync(sectionDestDir)) continue;
        const hasReadme = fs.existsSync(path.join(sectionDestDir, "readme.md"));
        const hasIndex = fs.existsSync(path.join(sectionDestDir, "index.md"));
        if (hasReadme || hasIndex) continue;

        const label = sectionLabels[section] || section;
        const sectionFiles = listMarkdownFiles(sectionDestDir);
        const fileLinks = sectionFiles
          .map((f) => {
            const slug = f.replace(/\.md$/, "");
            const name = slug.replace(/^\d+-/, "").replace(/-/g, " ");
            return `- [${name}](${slug})`;
          })
          .join("\n");
        const sectionIndex = [
          "---",
          `title: "${label}"`,
          "sidebar_position: 0",
          "---",
          "",
          `# ${label}`,
          "",
          fileLinks,
          "",
        ].join("\n");
        fs.writeFileSync(path.join(sectionDestDir, "index.md"), sectionIndex, "utf-8");
        courseFileCount++;
      }

      // --- Generate course index.md landing page ---
      if (courseFileCount > 0) {
        const courseDestDir = path.join(DOCS_DIR, semester, course);
        const indexPath = path.join(courseDestDir, "index.md");
        const sections = [];
        if (courseManifest.sections["guide"]) {
          sections.push("- [Guide](guide/)");
        }
        if (courseManifest.sections["exercises"]) {
          sections.push("- [Exercices](exercises/)");
        }
        if (courseManifest.sections["exam-prep"]) {
          sections.push("- [Preparation Examen](exam-prep/)");
        }
        if (courseManifest.sections["tp"]) {
          sections.push("- [TP (Enonces)](tp/)");
        }
        const indexContent = [
          "---",
          `title: "${courseTitle.replace(/"/g, '\\"')}"`,
          "sidebar_position: 0",
          "---",
          "",
          `# ${courseTitle}`,
          "",
          ...sections,
          "",
        ].join("\n");
        mkdirSafe(courseDestDir);
        fs.writeFileSync(indexPath, indexContent, "utf-8");
        courseFileCount++;

        console.log(`Syncing ${semester}/${course}... ${courseFileCount} files`);
        semesterManifest.courses.push(courseManifest);
        totalFiles += courseFileCount;
      }
    }

    if (semesterManifest.courses.length > 0) {
      manifest.semesters.push(semesterManifest);
    }
  }

  // -----------------------------------------------------------------------
  // Write manifest
  // -----------------------------------------------------------------------
  mkdirSafe(STATIC_DIR);
  const manifestPath = path.join(STATIC_DIR, "courses.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log("");
  console.log(`Manifest written to ${manifestPath}`);

  // -----------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------
  console.log("");
  console.log("=== Sync Summary ===");
  console.log(`${totalFiles} files synced, ${totalErrors} errors`);
  if (totalErrors > 0) {
    process.exit(1);
  }
}

main();
