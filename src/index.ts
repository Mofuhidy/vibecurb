/**
 * CLI interface for vibecurb
 */

import { Command } from "commander";
import chalk from "chalk";
import * as path from "path";
import { scanDirectory } from "./scanner/detector";
import { ScanResult } from "./scanner/types";
import { autoFix, previewFixes } from "./fixer/auto-fix";

const program = new Command();

program
  .name("vibecurb")
  .description("Security scanner for vibe-coded apps")
  .version("0.1.0");

program
  .command("scan")
  .description("Scan files for secrets and sensitive data")
  .argument("[path]", "Path to scan (file or directory)", ".")
  .option(
    "-e, --extensions <exts>",
    "File extensions to scan (comma-separated)",
  )
  .option(
    "-s, --severity <level>",
    "Minimum severity level (error, warning, all)",
    "all",
  )
  .option("--exclude <dirs>", "Directories to exclude (comma-separated)")
  .option("--fix", "Auto-fix detected secrets")
  .option("--dry-run", "Preview fixes without applying")
  .option("--json", "Output results as JSON")
  .action(async (scanPath: string, options) => {
    try {
      const fullPath = path.resolve(scanPath);

      console.log(chalk.blue(`🔍 Scanning: ${fullPath}\n`));

      const extensions = options.extensions
        ? options.extensions.split(",").map((e: string) => e.trim())
        : undefined;

      const exclude = options.exclude
        ? options.exclude.split(",").map((e: string) => e.trim())
        : undefined;

      const results = scanDirectory({
        path: fullPath,
        extensions,
        exclude,
        severity: options.severity,
      });

      // Handle dry-run
      if (options.dryRun) {
        const allFindings = results.flatMap((r) => r.findings);
        if (allFindings.length > 0) {
          const preview = previewFixes(allFindings);
          console.log(chalk.blue("\n🔮 Fix Preview:\n"));
          console.log("Environment variables that would be created:");
          preview.envVars.forEach((v) => console.log(`  ${chalk.green(v)}`));
          console.log(
            `\nFiles that would be modified: ${preview.filesToModify.length}`,
          );
          preview.filesToModify.forEach((f) =>
            console.log(`  ${chalk.cyan(f)}`),
          );
        }
        return;
      }

      // Handle auto-fix
      if (options.fix) {
        const allFindings = results.flatMap((r) => r.findings);
        if (allFindings.length > 0) {
          console.log(chalk.blue("\n🔧 Auto-fixing secrets...\n"));
          const fixResult = autoFix(fullPath, allFindings);

          if (fixResult.success) {
            console.log(chalk.green(`✅ ${fixResult.message}`));
            console.log(
              chalk.green(
                `✅ Created .env with ${fixResult.envVars.length} variable(s)`,
              ),
            );
            console.log(chalk.green(`✅ Updated .gitignore`));
            console.log(chalk.gray(`\nModified files:`));
            fixResult.filesModified.forEach((f) =>
              console.log(`  ${chalk.cyan(f)}`),
            );
            console.log(chalk.yellow(`\n⚠️  Backups created: *.backup files`));
            console.log(chalk.blue(`\nNext steps:`));
            console.log(`  1. Review the changes`);
            console.log(`  2. Add real values to .env file`);
            console.log(`  3. Delete .backup files when satisfied`);
          } else {
            console.log(chalk.red(`❌ ${fixResult.message}`));
          }
        } else {
          console.log(chalk.green("✅ No secrets found to fix"));
        }
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        displayResults(results);
      }

      // Exit with error code if any errors found
      const hasErrors = results.some((r) =>
        r.findings.some((f) => f.severity === "error"),
      );

      if (hasErrors) {
        process.exit(1);
      }
    } catch (error) {
      console.error(
        chalk.red("❌ Scan failed:"),
        error instanceof Error ? error.message : "Unknown error",
      );
      process.exit(1);
    }
  });

function displayResults(results: ScanResult[]): void {
  let totalErrors = 0;
  let totalWarnings = 0;

  if (results.length === 0) {
    console.log(chalk.green("✅ No secrets or sensitive data found!"));
    return;
  }

  results.forEach((result) => {
    if (result.error) {
      console.log(chalk.yellow(`⚠️  ${result.filePath}: ${result.error}`));
      return;
    }

    console.log(chalk.bold(`\n📄 ${result.filePath}`));
    console.log(chalk.gray("─".repeat(50)));

    result.findings.forEach((finding) => {
      const severityColor =
        finding.severity === "error" ? chalk.red : chalk.yellow;
      const severityIcon = finding.severity === "error" ? "❌" : "⚠️";

      console.log(
        `${severityIcon} ${severityColor(finding.severity.toUpperCase())} Line ${finding.lineNumber}:${finding.column}`,
      );
      console.log(`   ${chalk.white(finding.message)}`);
      console.log(`   ${chalk.gray("Match:")} ${chalk.cyan(finding.match)}`);
      console.log(
        `   ${chalk.gray("Fix:")} ${chalk.green(finding.fixSuggestion)}`,
      );
      console.log();

      if (finding.severity === "error") {
        totalErrors++;
      } else {
        totalWarnings++;
      }
    });
  });

  // Summary
  console.log(chalk.bold("\n📊 Summary:"));
  console.log(chalk.gray("─".repeat(50)));

  if (totalErrors > 0) {
    console.log(chalk.red(`❌ ${totalErrors} error(s) found`));
  }

  if (totalWarnings > 0) {
    console.log(chalk.yellow(`⚠️  ${totalWarnings} warning(s) found`));
  }

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(chalk.green("✅ All clear!"));
  }
}

program.parse();
