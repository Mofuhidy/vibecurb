/**
 * Type definitions for vibecurb scanner
 */

export interface Finding {
  readonly filePath: string;
  readonly lineNumber: number;
  readonly column: number;
  readonly match: string;
  readonly pattern: string;
  readonly severity: "error" | "warning";
  readonly message: string;
  readonly fixSuggestion: string;
}

export interface ScanResult {
  readonly filePath: string;
  readonly findings: readonly Finding[];
  readonly error?: string;
}

export interface ScanOptions {
  readonly path: string;
  readonly extensions?: readonly string[];
  readonly exclude?: readonly string[];
  readonly severity?: "error" | "warning" | "all";
}
