/**
 * Auto-fix generator for secrets
 * Extracts secrets to .env file and replaces with process.env references
 */

import * as fs from "fs";
import * as path from "path";
import { Finding } from "../scanner/types";

export interface FixResult {
  readonly success: boolean;
  readonly message: string;
  readonly envVars: readonly string[];
  readonly filesModified: readonly string[];
  readonly backupCreated?: string;
}

interface EnvMapping {
  readonly pattern: string;
  readonly envName: string;
  readonly value: string;
}

/**
 * Generate environment variable name from pattern
 */
function generateEnvVarName(pattern: string, index: number): string {
  const patternToEnv: Record<string, string> = {
    "API Key (Generic)": "API_KEY",
    "AWS Access Key ID": "AWS_ACCESS_KEY_ID",
    "AWS Secret Key": "AWS_SECRET_ACCESS_KEY",
    "GitHub Token": "GITHUB_TOKEN",
    "Stripe Key": "STRIPE_SECRET_KEY",
    "Stripe Test Key": "STRIPE_TEST_KEY",
    "Database URL": "DATABASE_URL",
    "Bearer Token": "API_TOKEN",
    "Slack Token": "SLACK_TOKEN",
    "JWT Token": "JWT_SECRET",
    "Google API Key": "GOOGLE_API_KEY",
    "Password in Code": "PASSWORD",
    "Email Address": "CONTACT_EMAIL",
  };

  const baseName = patternToEnv[pattern] || "SECRET";
  return index > 0 ? `${baseName}_${index}` : baseName;
}

/**
 * Generate unique environment variable name avoiding duplicates
 */
function generateUniqueEnvVarName(
  pattern: string,
  usedNames: Set<string>,
): string {
  let index = 0;
  let envName = generateEnvVarName(pattern, index);

  while (usedNames.has(envName)) {
    index++;
    envName = generateEnvVarName(pattern, index);
  }

  usedNames.add(envName);
  return envName;
}

/**
 * Create .env file with extracted secrets
 */
function createEnvFile(
  projectPath: string,
  mappings: readonly EnvMapping[],
): string {
  const envPath = path.join(projectPath, ".env");
  const envContent = mappings.map((m) => `${m.envName}=${m.value}`).join("\n");

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    // Append to existing
    const existing = fs.readFileSync(envPath, "utf8");
    fs.writeFileSync(envPath, `${existing}\n${envContent}`);
  } else {
    // Create new
    fs.writeFileSync(envPath, envContent);
  }

  return envPath;
}

/**
 * Create .env.example file
 */
function createEnvExample(
  projectPath: string,
  envVars: readonly string[],
): string {
  const examplePath = path.join(projectPath, ".env.example");

  const exampleContent = envVars
    .map((v) => `${v}=your_${v.toLowerCase()}_here`)
    .join("\n");

  fs.writeFileSync(examplePath, exampleContent);
  return examplePath;
}

/**
 * Update .gitignore to exclude .env
 */
function updateGitignore(projectPath: string): string | null {
  const gitignorePath = path.join(projectPath, ".gitignore");
  const envEntries = [".env", ".env.local", ".env.*.local"];

  if (!fs.existsSync(gitignorePath)) {
    // Create new .gitignore
    fs.writeFileSync(gitignorePath, envEntries.join("\n") + "\n");
    return gitignorePath;
  }

  const content = fs.readFileSync(gitignorePath, "utf8");
  const lines = content.split("\n");

  // Check which entries are missing
  const missing = envEntries.filter((entry) => !lines.includes(entry));

  if (missing.length > 0) {
    fs.writeFileSync(gitignorePath, `${content}\n${missing.join("\n")}\n`);
    return gitignorePath;
  }

  return null; // Already has .env entries
}

/**
 * Create backup of original file
 */
function createBackup(filePath: string): string {
  const backupPath = `${filePath}.backup`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

/**
 * Apply fixes to a single file
 */
function applyFixesToFile(
  filePath: string,
  findings: readonly Finding[],
  envMappings: Map<string, string>, // match -> envVar
): boolean {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let modified = content;

    // Create backup first
    createBackup(filePath);

    // Replace each finding with env reference
    findings.forEach((finding) => {
      const envVar = envMappings.get(finding.match);
      if (envVar) {
        // Replace the entire assignment with env reference
        const patterns: Record<string, RegExp> = {
          "API Key (Generic)":
            /(api[_-]?key|apikey)\s*[:=]\s*["\'][^"\']+["\']/gi,
          "Database URL":
            /(const|let|var)\s+\w+\s*=\s*["\'][^"\']*(mongodb|mysql|postgres)[^"\']*["\']/gi,
          "JWT Token": /(const|let|var)\s+\w+\s*=\s*["\']eyJ[^"\']*["\']/gi,
          "Email Address":
            /(const|let|var)\s+\w+\s*=\s*["\'][^"\']*@[^"\']+["\']/gi,
        };

        const pattern = patterns[finding.pattern];
        if (pattern) {
          modified = modified.replace(pattern, `process.env.${envVar}`);
        }
      }
    });

    // Write modified content
    fs.writeFileSync(filePath, modified);
    return true;
  } catch (error) {
    console.error(`Failed to fix ${filePath}:`, error);
    return false;
  }
}

/**
 * Main auto-fix function
 */
export function autoFix(
  projectPath: string,
  findings: readonly Finding[],
): FixResult {
  const usedNames = new Set<string>();
  const envMappings: Map<string, string> = new Map();
  const mappings: EnvMapping[] = [];
  const filesModified: string[] = [];

  // Skip if no findings
  if (findings.length === 0) {
    return {
      success: true,
      message: "No secrets found to fix",
      envVars: [],
      filesModified: [],
    };
  }

  try {
    // Generate mappings
    findings.forEach((finding) => {
      if (!envMappings.has(finding.match)) {
        const envName = generateUniqueEnvVarName(finding.pattern, usedNames);
        envMappings.set(finding.match, envName);
        mappings.push({
          pattern: finding.pattern,
          envName,
          value: finding.match,
        });
      }
    });

    // Group findings by file
    const findingsByFile = new Map<string, Finding[]>();
    findings.forEach((finding) => {
      const fileFindings = findingsByFile.get(finding.filePath) || [];
      fileFindings.push(finding);
      findingsByFile.set(finding.filePath, fileFindings);
    });

    // Apply fixes to each file
    findingsByFile.forEach((fileFindings, filePath) => {
      if (applyFixesToFile(filePath, fileFindings, envMappings)) {
        filesModified.push(filePath);
      }
    });

    // Create .env file
    createEnvFile(projectPath, mappings);

    // Create .env.example
    createEnvExample(
      projectPath,
      mappings.map((m) => m.envName),
    );

    // Update .gitignore
    updateGitignore(projectPath);

    const envVarNames = mappings.map((m) => m.envName);

    return {
      success: true,
      message: `Fixed ${findings.length} secret(s) in ${filesModified.length} file(s)`,
      envVars: envVarNames,
      filesModified,
    };
  } catch (error) {
    return {
      success: false,
      message: `Auto-fix failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      envVars: [],
      filesModified: [],
    };
  }
}

/**
 * Preview what fixes would be applied (dry run)
 */
export function previewFixes(findings: readonly Finding[]): {
  readonly envVars: readonly string[];
  readonly filesToModify: readonly string[];
} {
  const usedNames = new Set<string>();
  const envVars: string[] = [];
  const filesToModify = new Set<string>();

  findings.forEach((finding) => {
    const envName = generateUniqueEnvVarName(finding.pattern, usedNames);
    envVars.push(`${envName}=${finding.match.substring(0, 20)}...`);
    filesToModify.add(finding.filePath);
  });

  return {
    envVars,
    filesToModify: Array.from(filesToModify),
  };
}
