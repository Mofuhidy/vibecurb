/**
 * Detection patterns for secrets
 * All test secrets use FAKE_[TYPE]_[NUMBER] format
 */

export interface Pattern {
  readonly name: string;
  readonly regex: RegExp;
  readonly severity: "error" | "warning";
  readonly message: string;
  readonly fixSuggestion: string;
}

export const PATTERNS: readonly Pattern[] = [
  {
    name: "Email Address",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    severity: "warning",
    message: "Email address found in code",
    fixSuggestion: "Move to environment variable: process.env.CONTACT_EMAIL",
  },
  {
    name: "API Key (Generic)",
    regex: /(api[_-]?key|apikey)\s*[:=]\s*["\'][a-zA-Z0-9_\-]{16,}["\']/i,
    severity: "error",
    message: "API key detected",
    fixSuggestion: "Use environment variable: process.env.API_KEY",
  },
  {
    name: "AWS Access Key ID",
    regex: /AKIA[0-9A-Z]{16}/,
    severity: "error",
    message: "AWS Access Key ID found",
    fixSuggestion: "Use AWS credentials file or environment variables",
  },
  {
    name: "AWS Secret Key",
    regex:
      /["\']?[Aa][Ww][Ss][_-]?[Ss][Ee][Cc][Rr][Ee][Tt][_-]?[Kk][Ee][Yy]["\']?\s*[:=]\s*["\'][a-zA-Z0-9/+=]{40}["\']/i,
    severity: "error",
    message: "AWS Secret Access Key found",
    fixSuggestion: "Use AWS credentials file or environment variables",
  },
  {
    name: "GitHub Token",
    regex: /gh[pousr]_[A-Za-z0-9_]{36,}/,
    severity: "error",
    message: "GitHub token detected",
    fixSuggestion: "Use environment variable: process.env.GITHUB_TOKEN",
  },
  {
    name: "Stripe Key",
    regex: /sk_live_[0-9a-zA-Z]{24,}/,
    severity: "error",
    message: "Stripe live secret key found",
    fixSuggestion: "Use environment variable: process.env.STRIPE_SECRET_KEY",
  },
  {
    name: "Stripe Test Key",
    regex: /sk_test_[0-9a-zA-Z]{24,}/,
    severity: "warning",
    message: "Stripe test key found",
    fixSuggestion:
      "Even test keys should be in environment variables: process.env.STRIPE_TEST_KEY",
  },
  {
    name: "Private Key",
    regex: /-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/,
    severity: "error",
    message: "Private key detected",
    fixSuggestion: "Store in secure key management system, never in code",
  },
  {
    name: "Database URL",
    regex: /(mongodb|mysql|postgres|postgresql|redis):\/\/[^\s"\']+/i,
    severity: "error",
    message: "Database connection string found",
    fixSuggestion: "Use environment variable: process.env.DATABASE_URL",
  },
  {
    name: "Bearer Token",
    regex: /[Bb]earer\s+[a-zA-Z0-9_\-\.=]+/,
    severity: "error",
    message: "Bearer token detected",
    fixSuggestion: "Use environment variable or secure token storage",
  },
  {
    name: "Password in Code",
    regex: /(password|passwd|pwd)\s*[:=]\s*["\'][^"\']{4,}["\']/i,
    severity: "error",
    message: "Hardcoded password found",
    fixSuggestion: "Use environment variable or secure credential storage",
  },
  {
    name: "Slack Token",
    regex: /xox[baprs]-[0-9a-zA-Z]{10,48}/,
    severity: "error",
    message: "Slack token detected",
    fixSuggestion: "Use environment variable: process.env.SLACK_TOKEN",
  },
  {
    name: "JWT Token",
    regex: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/,
    severity: "error",
    message: "JWT token detected",
    fixSuggestion: "Use environment variable or secure token storage",
  },
  {
    name: "Google API Key",
    regex: /AIza[0-9A-Za-z_-]{35}/,
    severity: "error",
    message: "Google API key found",
    fixSuggestion: "Use environment variable: process.env.GOOGLE_API_KEY",
  },
];
