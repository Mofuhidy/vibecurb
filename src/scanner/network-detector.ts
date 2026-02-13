/**
 * Network security detector
 * Scans code for sensitive data exposure in network requests and responses
 */

import * as fs from "fs";
import { NETWORK_PATTERNS, NETWORK_SECURITY_CHECKS } from "./network-patterns";
import { Finding } from "./types";

export interface NetworkFinding extends Finding {
  readonly category: "request" | "response" | "logging" | "error-handling";
}

/**
 * Scan file for network security issues
 */
export function scanNetworkSecurity(
  filePath: string,
  options: { severity?: "error" | "warning" | "all" } = {},
): NetworkFinding[] {
  const findings: NetworkFinding[] = [];

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      // Check patterns
      NETWORK_PATTERNS.forEach((pattern) => {
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
          findings.push({
            filePath,
            lineNumber: index + 1,
            column: (match.index || 0) + 1,
            match: match[0].substring(0, 100),
            pattern: pattern.name,
            severity: pattern.severity,
            message: pattern.message,
            fixSuggestion: pattern.fixSuggestion,
            category: pattern.category,
          });
        }
      });

      // Run additional security checks
      NETWORK_SECURITY_CHECKS.forEach((check) => {
        if (check.check(line)) {
          findings.push({
            filePath,
            lineNumber: index + 1,
            column: 1,
            match: line.substring(0, 100),
            pattern: check.name,
            severity: check.severity,
            message: check.description,
            fixSuggestion: "Review this code for security issues",
            category: "logging", // Default category for custom checks
          });
        }
      });
    });
  } catch (error) {
    // Log minimal error info
    console.error(`Error reading file for network scan: ${filePath}`);
  }

  return findings;
}

/**
 * Get summary of network security findings by category
 */
export function getNetworkSecuritySummary(
  findings: NetworkFinding[],
): Record<string, number> {
  const summary: Record<string, number> = {
    request: 0,
    response: 0,
    logging: 0,
    "error-handling": 0,
  };

  findings.forEach((finding) => {
    summary[finding.category]++;
  });

  return summary;
}

/**
 * Check if code has proper error handling for network requests
 */
export function hasProperErrorHandling(content: string): boolean {
  // Check for common patterns that indicate proper error handling
  const hasTryCatch =
    /try\s*\{[\s\S]*?fetch|axios|XMLHttpRequest[\s\S]*?\}\s*catch/gi.test(
      content,
    );
  const hasCatchBlock = /\.catch\s*\(/gi.test(content);

  return hasTryCatch || hasCatchBlock;
}
