/**
 * Tests for the scanner module
 * Uses FAKE_ prefixes to avoid triggering detection
 */

import { scanFile, scanDirectory } from "../src/scanner/detector";
import * as fs from "fs";
import * as path from "path";

// Create temp directory for tests
const TEST_DIR = path.join(__dirname, "temp-test-files");

describe("Scanner", () => {
  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // Cleanup
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true });
    }
  });

  describe("scanFile", () => {
    it("should detect email addresses", () => {
      const testFile = path.join(TEST_DIR, "test-emails.js");
      fs.writeFileSync(testFile, 'const contact = "admin@example.com";');

      const findings = scanFile(testFile);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].pattern).toBe("Email Address");
      expect(findings[0].severity).toBe("warning");

      fs.unlinkSync(testFile);
    });

    it("should detect API keys", () => {
      const testFile = path.join(TEST_DIR, "test-apikeys.js");
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
      const testFile = path.join(TEST_DIR, "test-fake.js");
      fs.writeFileSync(testFile, 'const apiKey = "FAKE_API_KEY_001";');

      const findings = scanFile(testFile);

      expect(findings.length).toBe(0);

      fs.unlinkSync(testFile);
    });

    it("should detect database URLs", () => {
      const testFile = path.join(TEST_DIR, "test-db.js");
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
      // Create test files
      const subDir = path.join(TEST_DIR, "subdir");
      fs.mkdirSync(subDir, { recursive: true });

      fs.writeFileSync(
        path.join(TEST_DIR, "file1.js"),
        'const email = "test@test.com";',
      );

      fs.writeFileSync(
        path.join(subDir, "file2.js"),
        'const key = "supersecretkey1234567890";',
      );

      const results = scanDirectory({ path: TEST_DIR });

      expect(results.length).toBeGreaterThan(0);

      // Cleanup
      fs.rmSync(subDir, { recursive: true });
      fs.unlinkSync(path.join(TEST_DIR, "file1.js"));
    });

    it("should respect file extensions filter", () => {
      fs.writeFileSync(
        path.join(TEST_DIR, "test.js"),
        'const email = "test@test.com";',
      );

      fs.writeFileSync(
        path.join(TEST_DIR, "test.txt"),
        'const email = "other@test.com";',
      );

      const results = scanDirectory({
        path: TEST_DIR,
        extensions: [".js"],
      });

      // Should only find JS file
      expect(results.some((r) => r.filePath.endsWith(".js"))).toBe(true);

      // Cleanup
      fs.unlinkSync(path.join(TEST_DIR, "test.js"));
      fs.unlinkSync(path.join(TEST_DIR, "test.txt"));
    });

    it("should respect exclude patterns", () => {
      const nodeModulesDir = path.join(TEST_DIR, "node_modules");
      fs.mkdirSync(nodeModulesDir, { recursive: true });

      fs.writeFileSync(
        path.join(nodeModulesDir, "secret.js"),
        'const key = "shouldnotscan";',
      );

      const results = scanDirectory({ path: TEST_DIR });

      // Should not scan node_modules
      expect(results.some((r) => r.filePath.includes("node_modules"))).toBe(
        false,
      );

      // Cleanup
      fs.rmSync(nodeModulesDir, { recursive: true });
    });
  });
});
