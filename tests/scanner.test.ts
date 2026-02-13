/**
 * Tests for the scanner module
 * Uses FAKE_ prefixes to avoid triggering detection
 */

import { scanFile, scanDirectory } from "../src/scanner/detector";
import * as fs from "fs";
import * as path from "path";

// Use a unique test directory for this test run
const TEST_RUN_ID = Date.now().toString(36);
const BASE_TEST_DIR = path.join(__dirname, `test-run-${TEST_RUN_ID}`);

describe("Scanner", () => {
  // Create base directory before all tests
  beforeAll(() => {
    if (!fs.existsSync(BASE_TEST_DIR)) {
      fs.mkdirSync(BASE_TEST_DIR, { recursive: true });
    }
  });

  // Clean up after all tests
  afterAll(() => {
    if (fs.existsSync(BASE_TEST_DIR)) {
      fs.rmSync(BASE_TEST_DIR, { recursive: true, force: true });
    }
  });

  describe("scanFile", () => {
    // Use a unique directory for scanFile tests
    const SCANFILE_DIR = path.join(BASE_TEST_DIR, "scanfile-tests");

    beforeAll(() => {
      if (!fs.existsSync(SCANFILE_DIR)) {
        fs.mkdirSync(SCANFILE_DIR, { recursive: true });
      }
    });

    it("should detect email addresses", () => {
      const testFile = path.join(SCANFILE_DIR, `email-test-${Date.now()}.js`);
      fs.writeFileSync(testFile, 'const contact = "admin@company.com";');

      const findings = scanFile(testFile);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].pattern).toBe("Email Address");
      expect(findings[0].severity).toBe("warning");

      fs.unlinkSync(testFile);
    });

    it("should detect API keys", () => {
      const testFile = path.join(SCANFILE_DIR, `apikey-test-${Date.now()}.js`);
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
      const testFile = path.join(SCANFILE_DIR, `fake-test-${Date.now()}.js`);
      fs.writeFileSync(testFile, 'const apiKey = "FAKE_API_KEY_001";');

      const findings = scanFile(testFile);

      expect(findings.length).toBe(0);

      fs.unlinkSync(testFile);
    });

    it("should detect database URLs", () => {
      const testFile = path.join(SCANFILE_DIR, `db-test-${Date.now()}.js`);
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
    // Use a unique directory for scanDirectory tests
    const SCANDIR_DIR = path.join(BASE_TEST_DIR, "scandir-tests");

    beforeEach(() => {
      // Clean and recreate before each test
      if (fs.existsSync(SCANDIR_DIR)) {
        fs.rmSync(SCANDIR_DIR, { recursive: true, force: true });
      }
      fs.mkdirSync(SCANDIR_DIR, { recursive: true });
    });

    afterEach(() => {
      // Clean up after each test
      if (fs.existsSync(SCANDIR_DIR)) {
        fs.rmSync(SCANDIR_DIR, { recursive: true, force: true });
      }
    });

    it("should scan directory recursively", () => {
      const subDir = path.join(SCANDIR_DIR, "subdir");
      fs.mkdirSync(subDir, { recursive: true });

      const file1 = path.join(SCANDIR_DIR, "file1.js");
      const file2 = path.join(subDir, "file2.js");

      fs.writeFileSync(file1, 'const email = "test@test.com";');
      fs.writeFileSync(
        file2,
        'const apiKey = "sk-12345678901234567890abcdef";',
      );

      const results = scanDirectory({ path: SCANDIR_DIR });

      expect(results.length).toBeGreaterThan(0);
    });

    it("should respect file extensions filter", () => {
      const jsFile = path.join(SCANDIR_DIR, "test.js");
      const txtFile = path.join(SCANDIR_DIR, "test.txt");

      fs.writeFileSync(jsFile, 'const email = "test@test.com";');
      fs.writeFileSync(txtFile, 'const email = "other@test.com";');

      const results = scanDirectory({
        path: SCANDIR_DIR,
        extensions: [".js"],
      });

      // Should only find JS file
      expect(results.some((r) => r.filePath.endsWith(".js"))).toBe(true);
      expect(results.some((r) => r.filePath.endsWith(".txt"))).toBe(false);
    });

    it("should respect exclude patterns", () => {
      const nodeModulesDir = path.join(SCANDIR_DIR, "node_modules");
      fs.mkdirSync(nodeModulesDir, { recursive: true });

      fs.writeFileSync(
        path.join(nodeModulesDir, "secret.js"),
        'const apiKey = "sk-12345678901234567890abcdef";',
      );

      const results = scanDirectory({ path: SCANDIR_DIR });

      // Should not scan node_modules
      expect(results.some((r) => r.filePath.includes("node_modules"))).toBe(
        false,
      );
    });
  });
});
