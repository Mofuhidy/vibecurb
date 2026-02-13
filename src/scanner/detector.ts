/**
 * Secret detector - scans files for sensitive data
 */

import * as fs from "fs";
import * as path from "path";
import { PATTERNS } from "./patterns";
import { Finding, ScanResult, ScanOptions } from "./types";

const DEFAULT_EXTENSIONS = [
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".json",
  ".yaml",
  ".yml",
  ".md",
  ".txt",
] as const;

const DEFAULT_EXCLUDE = [
  "node_modules",
  "dist",
  "build",
  ".git",
  "coverage",
  ".env",
  ".env.local",
  ".next",
] as const;

export function scanFile(
  filePath: string,
  options: { severity?: "error" | "warning" | "all" } = {},
): Finding[] {
  const findings: Finding[] = [];

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      PATTERNS.forEach(pattern => {
        // Skip if severity filter doesn't match
        if (
          options.severity &&
          options.severity !== "all" &&
          pattern.severity !== options.severity
        ) {
          return;
        }

        const matches = line.matchAll(pattern.regex);

        for (const match of matches) {
          // Skip test fixtures that contain FAKE_ prefix
          if (match[0].includes("FAKE_") || match[0].includes("YOUR_")) {
            continue;
          }

          // Skip example/documentation placeholders
          if (
            match[0].includes("example") ||
            match[0].includes("placeholder") ||
            match[0].includes("xxx") ||
            match[0].includes("XXXX")
          ) {
            continue;
          }

          findings.push({
            filePath,
            lineNumber: index + 1,
            column: (match.index || 0) + 1,
            match: match[0].substring(0, 100), // Limit length for display
            pattern: pattern.name,
            severity: pattern.severity,
            message: pattern.message,
            fixSuggestion: pattern.fixSuggestion,
          });
        }
      });
    });
  } catch (error) {
    // Log minimal error info without exposing file contents
    console.error(`Error reading file: ${path.basename(filePath)}`);
  }

  return findings;
}

export function scanDirectory(options: ScanOptions): ScanResult[] {
  const results: ScanResult[] = [];
  const extensions = options.extensions || DEFAULT_EXTENSIONS;
  const exclude = options.exclude || DEFAULT_EXCLUDE;

  function scanRecursive(dirPath: string): void {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        // Skip excluded directories
        if (entry.isDirectory()) {
          if (!exclude.includes(entry.name)) {
            scanRecursive(fullPath);
          }
          continue;
        }

        // Check file extension
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          const findings = scanFile(fullPath, {
            severity: options.severity,
          });

          if (findings.length > 0) {
            results.push({
              filePath: fullPath,
              findings,
            });
          }
        }
      }
    } catch (error) {
      results.push({
        filePath: dirPath,
        findings: [],
        error: "Permission denied or directory not accessible",
      });
    }
  }

  const stat = fs.statSync(options.path);

  if (stat.isFile()) {
    const findings = scanFile(options.path, { severity: options.severity });
    if (findings.length > 0) {
      results.push({
        filePath: options.path,
        findings,
      });
    }
  } else if (stat.isDirectory()) {
    scanRecursive(options.path);
  }

  return results;
}
