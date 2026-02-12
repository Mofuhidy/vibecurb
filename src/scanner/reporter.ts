/**
 * Reporter module for formatting scan results
 */

import { ScanResult, Finding } from "./types";

export interface ReportOptions {
  readonly format: "console" | "json" | "markdown";
  readonly showFixes?: boolean;
}

export function generateReport(
  results: ScanResult[],
  options: ReportOptions,
): string {
  switch (options.format) {
    case "json":
      return generateJsonReport(results);
    case "markdown":
      return generateMarkdownReport(results);
    case "console":
    default:
      return generateConsoleReport(results, options.showFixes ?? true);
  }
}

function generateJsonReport(results: ScanResult[]): string {
  // Redact sensitive match content in JSON output
  const sanitizedResults = results.map((result) => ({
    ...result,
    findings: result.findings.map((finding) => ({
      ...finding,
      match: "[REDACTED]",
    })),
  }));

  return JSON.stringify(sanitizedResults, null, 2);
}

function generateMarkdownReport(results: ScanResult[]): string {
  let report = "# Vibecurb Security Report\n\n";

  const errorCount = results.reduce(
    (sum, r) => sum + r.findings.filter((f) => f.severity === "error").length,
    0,
  );

  const warningCount = results.reduce(
    (sum, r) => sum + r.findings.filter((f) => f.severity === "warning").length,
    0,
  );

  report += `## Summary\n\n`;
  report += `- **Errors:** ${errorCount}\n`;
  report += `- **Warnings:** ${warningCount}\n`;
  report += `- **Files Scanned:** ${results.length}\n\n`;

  if (results.length === 0) {
    report += "✅ No secrets or sensitive data found!\n";
    return report;
  }

  report += "## Findings\n\n";

  results.forEach((result) => {
    report += `### ${result.filePath}\n\n`;

    result.findings.forEach((finding) => {
      const icon = finding.severity === "error" ? "❌" : "⚠️";
      report += `${icon} **${finding.severity.toUpperCase()}** - Line ${finding.lineNumber}\n\n`;
      report += `- **Issue:** ${finding.message}\n`;
      report += `- **Pattern:** ${finding.pattern}\n`;
      report += `- **Fix:** ${finding.fixSuggestion}\n\n`;
    });
  });

  return report;
}

function generateConsoleReport(
  results: ScanResult[],
  showFixes: boolean,
): string {
  // This is handled by the CLI directly with chalk colors
  // Return a text summary for other use cases
  const errorCount = results.reduce(
    (sum, r) => sum + r.findings.filter((f) => f.severity === "error").length,
    0,
  );

  const warningCount = results.reduce(
    (sum, r) => sum + r.findings.filter((f) => f.severity === "warning").length,
    0,
  );

  return `Found ${errorCount} errors and ${warningCount} warnings in ${results.length} file(s)`;
}

export function hasErrors(results: ScanResult[]): boolean {
  return results.some((r) => r.findings.some((f) => f.severity === "error"));
}

export function getStats(results: ScanResult[]): {
  errors: number;
  warnings: number;
  files: number;
} {
  return {
    errors: results.reduce(
      (sum, r) => sum + r.findings.filter((f) => f.severity === "error").length,
      0,
    ),
    warnings: results.reduce(
      (sum, r) =>
        sum + r.findings.filter((f) => f.severity === "warning").length,
      0,
    ),
    files: results.length,
  };
}
