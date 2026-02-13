/**
 * Network security patterns
 * Detects sensitive data exposure in network requests, responses, and logging
 */

export interface NetworkPattern {
  readonly name: string;
  readonly regex: RegExp;
  readonly severity: "error" | "warning";
  readonly message: string;
  readonly fixSuggestion: string;
  readonly category: "request" | "response" | "logging" | "error-handling";
}

export const NETWORK_PATTERNS: readonly NetworkPattern[] = [
  // Console logging patterns
  {
    name: "Console Log with User Object",
    regex:
      /console\.(log|debug|info|warn|error)\s*\(\s*[^)]*(?:user|req\.user|auth\.user)[^)]*\)/gi,
    severity: "error",
    message: "Console logging may expose user data",
    fixSuggestion: "Use a structured logger with data redaction",
    category: "logging",
  },
  {
    name: "Console Log with API Response",
    regex: /console\.(log|debug|info)\s*\(\s*[^)]*(?:response|res|data)\s*\)/gi,
    severity: "warning",
    message: "Console logging API responses may expose sensitive data",
    fixSuggestion: "Log only necessary fields, never full responses",
    category: "logging",
  },
  {
    name: "Console Log with Authorization Header",
    regex:
      /console\.(log|debug|info|warn|error)\s*\(\s*[^)]*(?:authorization|auth|token|header)[^)]*\)/gi,
    severity: "error",
    message: "Never log authorization headers or tokens",
    fixSuggestion: "Remove logging of auth headers immediately",
    category: "logging",
  },

  // Fetch/XHR request patterns
  {
    name: "Fetch with Hardcoded Authorization",
    regex:
      /fetch\s*\([^)]*\{[^}]*headers\s*:\s*\{[^}]*(?:Authorization|authorization)\s*:\s*["'][^"']+["']/gi,
    severity: "error",
    message: "Hardcoded authorization header in fetch request",
    fixSuggestion: "Use environment variables for tokens",
    category: "request",
  },
  {
    name: "Axios with Hardcoded Authorization",
    regex:
      /axios\.(get|post|put|delete|patch)\s*\([^)]*\{[^}]*headers\s*:\s*\{[^}]*(?:Authorization|authorization)\s*:\s*["'][^"']+["']/gi,
    severity: "error",
    message: "Hardcoded authorization header in axios request",
    fixSuggestion: "Use environment variables or request interceptors",
    category: "request",
  },
  {
    name: "API Key in Query Parameters",
    regex:
      /(?:fetch|axios|XMLHttpRequest)\s*\([^)]*\?[^)]*(?:api[_-]?key|token|auth)=/gi,
    severity: "error",
    message: "API key exposed in URL query parameters",
    fixSuggestion: "Move API keys to headers or request body",
    category: "request",
  },

  // Response handling patterns
  {
    name: "Return Full User Object in Response",
    regex: /res\.(json|send)\s*\(\s*\{[^}]*user\s*:\s*(?:user|req\.user|doc)/gi,
    severity: "error",
    message: "API response may expose full user object with sensitive fields",
    fixSuggestion: "Select only necessary fields before sending response",
    category: "response",
  },
  {
    name: "Return Database Document Directly",
    regex: /res\.(json|send)\s*\(\s*(?:doc|document|result|data)\s*\)/gi,
    severity: "warning",
    message: "Returning database documents may expose internal fields",
    fixSuggestion: "Map database results to DTOs before returning",
    category: "response",
  },
  {
    name: "Error Response with Stack Trace",
    regex:
      /res\.(status|sendStatus)\s*\([^)]+\)\s*\.\s*(?:json|send)\s*\(\s*\{[^}]*(?:error|stack|message).*\}/gi,
    severity: "error",
    message: "Error response may expose stack traces or internal errors",
    fixSuggestion:
      "Return generic error messages to clients, log details server-side",
    category: "error-handling",
  },
  {
    name: "Console Log in Error Handler",
    regex:
      /catch\s*\([^)]*\)\s*\{[^}]*console\.(log|error)\s*\(\s*(?:error|err|e)/gi,
    severity: "warning",
    message: "Error logged to console may expose sensitive context",
    fixSuggestion: "Use proper error tracking service (Sentry, etc.)",
    category: "error-handling",
  },

  // HTTP client configuration
  {
    name: "Axios Instance with Hardcoded Config",
    regex:
      /axios\.create\s*\(\s*\{[^}]*(?:baseURL|url)\s*:\s*["'][^"']*(?:api|internal|admin)[^"']*["']/gi,
    severity: "warning",
    message: "Hardcoded API URLs in axios configuration",
    fixSuggestion: "Use environment variables for API base URLs",
    category: "request",
  },

  // CORS/Security headers
  {
    name: "Wildcard CORS Origin",
    regex: /(?:cors|Access-Control-Allow-Origin)\s*[:=]\s*["']\*/gi,
    severity: "warning",
    message: "Wildcard CORS allows requests from any origin",
    fixSuggestion: "Specify allowed origins explicitly",
    category: "request",
  },

  // Debug/development code
  {
    name: "Debugger Statement",
    regex: /debugger;/gi,
    severity: "error",
    message: "Debugger statement should not be in production code",
    fixSuggestion: "Remove debugger statements before deployment",
    category: "logging",
  },
  {
    name: "TODO/FIXME with Sensitive Context",
    regex:
      /(?:TODO|FIXME|XXX|HACK)\s*:?\s*[^\n]*(?:auth|token|password|secret|key)/gi,
    severity: "warning",
    message: "Comment may indicate incomplete security implementation",
    fixSuggestion: "Review and address security TODOs before deployment",
    category: "logging",
  },
];

/**
 * Additional checks for network security
 */
export interface NetworkSecurityCheck {
  readonly name: string;
  readonly description: string;
  readonly severity: "error" | "warning";
  readonly check: (content: string) => boolean;
}

export const NETWORK_SECURITY_CHECKS: readonly NetworkSecurityCheck[] = [
  {
    name: "Missing Error Handler",
    description: "Promise without catch block may expose unhandled errors",
    severity: "warning",
    check: (content: string) => {
      // Simple check for fetch without catch
      const fetchWithoutCatch = /fetch\s*\([^)]+\)\s*\.then\s*\(/gi;
      return fetchWithoutCatch.test(content);
    },
  },
  {
    name: "Raw Error in Response",
    description: "Raw error objects sent in responses",
    severity: "error",
    check: (content: string) => {
      const rawError = /res\.(json|send)\s*\(\s*(?:error|err)\s*\)/gi;
      return rawError.test(content);
    },
  },
];
