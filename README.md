<p align="center">
  <h1 align="center">🔒 vibecurb</h1>
  <p align="center">Security layer for vibe-coded apps</p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a> •
    <a href="#configuration">Configuration</a>
  </p>
</p>

---

## 🎯 What is vibecurb?

**vibecurb** prevents insecure vibe coding from happening. Instead of scanning apps after they're built, it acts as a security layer that catches secrets before they reach your codebase.

> "We don't scan vibe-coded apps. We prevent insecure vibe coding from happening."

## ✨ Features

### Current (v0.1.0)

- ✅ **14 Secret Detection Patterns**
  - Email addresses
  - API keys (generic)
  - AWS credentials
  - GitHub tokens
  - Stripe keys (live & test)
  - Private keys
  - Database URLs
  - Bearer tokens
  - Hardcoded passwords
  - Slack tokens
  - JWT tokens
  - Google API keys

- ✅ **Smart Filtering**
  - Ignores test fixtures (FAKE\_ prefix)
  - Ignores placeholder values
  - Respects .gitignore patterns

- ✅ **CLI Interface**
  - Scan files or directories
  - Colored output with severity levels
  - Fix suggestions for each finding
  - JSON output for CI/CD
  - Exit codes for automation

- ✅ **Three Command Aliases**
  ```bash
  vibecurb scan    # Full name
  vibe scan        # Short & memorable
  vc scan          # Power user shortcut
  ```

### Coming Soon

- 🚧 **Auto-fix Generation** - Extract secrets to .env files
- 🚧 **Git Hooks** - Pre-commit scanning
- 🚧 **GitHub Actions** - Automated PR checks
- 🚧 **VSCode Extension** - Real-time in-editor warnings
- 🚧 **AI Agent Rules** - Configuration for AI coding assistants

## 🚀 Installation

### Global Install (Recommended for CLI use)

```bash
npm install -g vibecurb
```

### Local Install (Project-specific)

```bash
npm install --save-dev vibecurb
```

## 📖 Usage

### Basic Scan

```bash
# Scan current directory
vibecurb scan

# Scan specific directory
vibecurb scan ./src

# Scan specific file
vibecurb scan config.js
```

### Options

```bash
# Filter by severity
vibecurb scan --severity error    # Only errors
vibecurb scan --severity warning  # Only warnings

# Specify file extensions
vibecurb scan --extensions .js,.ts,.json

# Exclude directories
vibecurb scan --exclude node_modules,dist,coverage

# JSON output (for CI/CD)
vibecurb scan --json
```

### Exit Codes

- `0` - No secrets found
- `1` - Errors found (CI/CD will fail)

## 🛠️ Configuration

Create a `.vibecurbrc.json` file in your project root:

```json
{
  "extensions": [".js", ".ts", ".jsx", ".tsx"],
  "exclude": ["node_modules", "dist", "build"],
  "severity": "all",
  "rules": {
    "no-hardcoded-secrets": "error",
    "no-frontend-api-keys": "error",
    "env-vars-required": "error"
  }
}
```

## 🔒 Security Philosophy

vibecurb follows strict security principles:

1. **Never expose sensitive data** - All findings are processed locally
2. **No cloud dependency** - 100% local scanning
3. **Minimal logging** - No user data in logs
4. **Fail secure** - Exit with error code if secrets found
5. **Safe defaults** - Aggressive detection, user decides false positives

## 🧪 Testing Safe Secrets

When writing tests, use the `FAKE_` prefix to avoid triggering detection:

```javascript
// ✅ Safe - will be ignored
const apiKey = "FAKE_API_KEY_001";
const email = "FAKE_EMAIL_001@test.com";

// ❌ Will be detected
const apiKey = "sk-live-actual-secret-key";
```

## 📦 Development

```bash
# Clone repository
git clone https://github.com/yourusername/vibecurb.git
cd vibecurb

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run with hot reload
npm run dev
```

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

## 📄 License

MIT © [Your Name]

## 🙏 Acknowledgments

- Inspired by [truffleHog](https://github.com/trufflesecurity/truffleHog) and [GitGuardian](https://www.gitguardian.com/)
- Built for the vibe-coding era
- Security-first by design

---

<p align="center">
  Made with 🔒 by developers who care about security
</p>
