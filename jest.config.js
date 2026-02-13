/**
 * Jest configuration
 */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  // Run tests sequentially to avoid file system race conditions
  maxWorkers: 1,
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
};
