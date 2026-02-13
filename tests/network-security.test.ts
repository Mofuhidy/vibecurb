/**
 * Tests for network security scanner
 */

import { scanNetworkSecurity } from "../src/scanner/network-detector";
import * as fs from "fs";
import * as path from "path";

const TEST_DIR = path.join(__dirname, "temp-network-tests");

describe("Network Security Scanner", () => {
  beforeAll(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true });
    }
  });

  it("should detect console.log with user object", () => {
    const testFile = path.join(TEST_DIR, `console-user-${Date.now()}.js`);
    fs.writeFileSync(testFile, "console.log(user);");

    const findings = scanNetworkSecurity(testFile);

    expect(
      findings.some((f) => f.pattern === "Console Log with User Object"),
    ).toBe(true);
    fs.unlinkSync(testFile);
  });

  it("should detect console.log with authorization header", () => {
    const testFile = path.join(TEST_DIR, `console-auth-${Date.now()}.js`);
    fs.writeFileSync(testFile, "console.log(authorizationHeader);");

    const findings = scanNetworkSecurity(testFile);

    expect(
      findings.some(
        (f) => f.pattern === "Console Log with Authorization Header",
      ),
    ).toBe(true);
    fs.unlinkSync(testFile);
  });

  it("should detect fetch with hardcoded authorization", () => {
    const testFile = path.join(TEST_DIR, `fetch-auth-${Date.now()}.js`);
    fs.writeFileSync(
      testFile,
      'fetch("/api", { headers: { Authorization: "Bearer token123" } })',
    );

    const findings = scanNetworkSecurity(testFile);

    expect(
      findings.some((f) => f.pattern === "Fetch with Hardcoded Authorization"),
    ).toBe(true);
    fs.unlinkSync(testFile);
  });

  it("should detect API key in query parameters", () => {
    const testFile = path.join(TEST_DIR, `query-apikey-${Date.now()}.js`);
    fs.writeFileSync(testFile, 'fetch("/api?api_key=secret123")');

    const findings = scanNetworkSecurity(testFile);

    expect(
      findings.some((f) => f.pattern === "API Key in Query Parameters"),
    ).toBe(true);
    fs.unlinkSync(testFile);
  });

  it("should detect returning full user object", () => {
    const testFile = path.join(TEST_DIR, `res-user-${Date.now()}.js`);
    fs.writeFileSync(testFile, "res.json({ user: req.user });");

    const findings = scanNetworkSecurity(testFile);

    expect(
      findings.some((f) => f.pattern === "Return Full User Object in Response"),
    ).toBe(true);
    fs.unlinkSync(testFile);
  });

  it("should detect debugger statement", () => {
    const testFile = path.join(TEST_DIR, `debugger-${Date.now()}.js`);
    fs.writeFileSync(testFile, "debugger;");

    const findings = scanNetworkSecurity(testFile);

    expect(findings.some((f) => f.pattern === "Debugger Statement")).toBe(true);
    fs.unlinkSync(testFile);
  });

  it("should detect wildcard CORS", () => {
    const testFile = path.join(TEST_DIR, `cors-${Date.now()}.js`);
    fs.writeFileSync(testFile, 'const cors = "*"');

    const findings = scanNetworkSecurity(testFile);

    expect(findings.some((f) => f.pattern === "Wildcard CORS Origin")).toBe(
      true,
    );
    fs.unlinkSync(testFile);
  });

  it("should detect axios with hardcoded authorization", () => {
    const testFile = path.join(TEST_DIR, `axios-auth-${Date.now()}.js`);
    fs.writeFileSync(
      testFile,
      'axios.get("/api", { headers: { Authorization: "Bearer token" } })',
    );

    const findings = scanNetworkSecurity(testFile);

    expect(
      findings.some((f) => f.pattern === "Axios with Hardcoded Authorization"),
    ).toBe(true);
    fs.unlinkSync(testFile);
  });

  it("should return empty array for safe code", () => {
    const testFile = path.join(TEST_DIR, `safe-${Date.now()}.js`);
    fs.writeFileSync(
      testFile,
      "const x = 1;\nconsole.log('Hello World');\nconst result = fetch('/api');",
    );

    const findings = scanNetworkSecurity(testFile);

    expect(findings.length).toBe(0);
    fs.unlinkSync(testFile);
  });
});
