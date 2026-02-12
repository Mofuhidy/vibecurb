/**
 * Tests for the scanner module
 * Uses FAKE_ prefixes to avoid triggering detection
 */

import { scanFile, scanDirectory } from "../src/scanner/detector";
import * as fs from "fs";
import * as path from "path";

// Create temp directories for tests
const SCANFILE_TEST_DIR = path.join(__dirname, "temp-scanfile-tests");
const SCANDIR_TEST_DIR = path.join(__dirname, "temp-scandir-tests");

// Helper to generate unique filenames
function getUniqueFilename(prefix: string, dir: string): string {
  return path.join(
    dir,
    `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}.js`,
  );
}

// Helper to generate unique filenames
function getUniqueFilename(prefix: string): string {
  return path.join(
    TEST_DIR,
    `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}.js`,
  );
}

describe("Scanner", () => {
  beforeAll(() => {
    // Create test directories
    if (!fs.existsSync(SCANFILE_TEST_DIR)) {
      fs.mkdirSync(SCANFILE_TEST_DIR, { recursive: true });
    }
    if (!fs.existsSync(SCANDIR_TEST_DIR)) {
      fs.mkdirSync(SCANDIR_TEST_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // Cleanup
    if (fs.existsSync(SCANFILE_TEST_DIR)) {
      fs.rmSync(SCANFILE_TEST_DIR, { recursive: true });
    }
    if (fs.existsSync(SCANDIR_TEST_DIR)) {
      fs.rmSync(SCANDIR_TEST_DIR, { recursive: true });
    }
  });

  describe("scanFile", () => {
    it("should detect email addresses", () => {
      const testFile = getUniqueFilename("test-emails", SCANFILE_TEST_DIR);
      fs.writeFileSync(testFile, 'const contact = "admin@company.com";');

      const findings = scanFile(testFile);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].pattern).toBe("Email Address");
      expect(findings[0].severity).toBe("warning");

      fs.unlinkSync(testFile);
    });

    it("should detect API keys", () => {
      const testFile = getUniqueFilename("test-apikeys", SCANFILE_TEST_DIR);
      fs.writeFileSync(
        testFile,
        'const apiKey = "sk-12345678901234567890abcdef";',
      );

      const findings = scanFile(testFile);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings.some((f) => f.pattern === "API Key (Generic)")).toBe(
        true,
      );

      fs.unlinkSync(testFile);
    });

    it("should ignore FAKE_ test data", () => {
      const testFile = getUniqueFilename("test-fake", SCANFILE_TEST_DIR);
      fs.writeFileSync(testFile, 'const apiKey = "FAKE_API_KEY_001";');

      const findings = scanFile(testFile);

      expect(findings.length).toBe(0);

      fs.unlinkSync(testFile);
    });

    it("should detect database URLs", () => {
      const testFile = getUniqueFilename("test-db", SCANFILE_TEST_DIR);
      fs.writeFileSync(
        testFile,
        'const dbUrl = "mongodb://user:pass@localhost:27017/db";',
      );

      const findings = scanFile(testFile);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings.some((f) => f.pattern === "Database URL")).toBe(true);

      fs.unlinkSync(testFile);
    });

    it("should handle non-existent files gracefully", () => {
      const findings = scanFile("/non/existent/file.js");

      expect(findings).toEqual([]);
    });
  });

  describe("scanDirectory", () => {
    it("should scan directory recursively", () => {
      // Create test files with unique names
      const subDir = path.join(SCANDIR_TEST_DIR, `subdir-${Date.now()}`);
      fs.mkdirSync(subDir, { recursive: true });

      const file1 = path.join(SCANDIR_TEST_DIR, `file1-${Date.now()}.js`);
      const file2 = path.join(subDir, `file2-${Date.now()}.js`);

      fs.writeFileSync(file1, 'const email = "test@test.com";');

      fs.writeFileSync(
        file2,
        'const apiKey = "sk-12345678901234567890abcdef";',
      );

      const results = scanDirectory({ path: SCANDIR_TEST_DIR });

      expect(results.length).toBeGreaterThan(0);

      // Cleanup
      fs.rmSync(subDir, { recursive: true });
      fs.unlinkSync(file1);
    });

    it("should respect file extensions filter", () => {
      const jsFile = path.join(SCANDIR_TEST_DIR, `test-${Date.now()}.js`);
      const txtFile = path.join(SCANDIR_TEST_DIR, `test-${Date.now()}.txt`);

      fs.writeFileSync(jsFile, 'const email = "test@test.com";');

      fs.writeFileSync(txtFile, 'const email = "other@test.com";');

      const results = scanDirectory({
        path: SCANDIR_TEST_DIR,
        extensions: [".js"],
      });

      // Should only find JS file
      expect(results.some((r) => r.filePath.endsWith(".js"))).toBe(true);

      // Cleanup
      fs.unlinkSync(jsFile);
      fs.unlinkSync(txtFile);
    });

    it("should respect exclude patterns", () => {
      const nodeModulesDir = path.join(
        SCANDIR_TEST_DIR,
        `node_modules-${Date.now()}`,
      );
      fs.mkdirSync(nodeModulesDir, { recursive: true });

      fs.writeFileSync(
        path.join(nodeModulesDir, "secret.js"),
        'const apiKey = "sk-12345678901234567890abcdef";',
      );

      const results = scanDirectory({ path: SCANDIR_TEST_DIR });

      // Should not scan node_modules
      expect(results.some((r) => r.filePath.includes("node_modules"))).toBe(
        false,
      );

      // Cleanup
      fs.rmSync(nodeModulesDir, { recursive: true });
    });
  });
});
