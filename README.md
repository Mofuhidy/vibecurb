<p align="center">
  <h1 align="center">🔒 vibecurb</h1>
  <p align="center">Security layer for vibe-coded apps</p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a> •
    <a href="#ai-integration">AI Integration</a> •
    <a href="#network-security">Network Security</a>
  </p>
</p>

---

## 🎯 What is vibecurb?

**vibecurb** prevents insecure vibe coding from happening. Instead of scanning apps after they're built, it acts as a security layer that catches secrets before they reach your codebase.

> "We don't scan vibe-coded apps. We prevent insecure vibe coding from happening."

## ✨ Features

### Secret Detection (14+ Patterns)

- ✅ **API Keys** - Generic, AWS, GitHub, Stripe, Google
- ✅ **Authentication** - Bearer tokens, JWT, passwords, private keys
- ✅ **Database** - Connection strings (MongoDB, PostgreSQL, MySQL, Redis)
- ✅ **Communication** - Slack tokens, email addresses
- ✅ **Smart Filtering** - Ignores test data (FAKE\_ prefix) and placeholders

### Network Security Scanner

Detect sensitive data exposure in:

- 🌐 **Console Logging** - User objects, auth headers, API responses
- 🌐 **HTTP Requests** - Hardcoded auth in fetch/axios, API keys in URLs
- 🌐 **API Responses** - Full user objects, database documents, stack traces
- 🌐 **Error Handling** - Raw errors exposed to clients
- 🌐 **CORS Configuration** - Wildcard origins, insecure headers

### Auto-Fix

- 🔧 **Extract secrets** to `.env` files automatically
- 🔧 **Replace code** with `process.env` references
- 🔧 **Create backups** before modifying files
- 🔧 **Update .gitignore** to exclude .env files

### AI Integration

- 🤖 **Universal AI support** - Works with Cursor, GitHub Copilot, Claude, etc.
- 🤖 **AI instructions** included for all major tools
- 🤖 **Prevents secrets** at generation time

## 🚀 Installation

```bash
# Global install
npm install -g vibecurb

# Or local install
npm install --save-dev vibecurb
```

## 📖 Usage

### Scan for Secrets

```bash
# Scan current directory
vibecurb scan

# Scan specific path
vibecurb scan ./src

# Auto-fix detected secrets
vibecurb scan --fix

# Preview fixes without applying
vibecurb scan --dry-run

# Filter by severity
vibecurb scan --severity error

# JSON output for CI/CD
vibecurb scan --json
```

### Scan Network Security

```bash
# Scan for logging/API exposure issues
vibecurb scan-network

# Scan specific directory
vibecurb scan-network ./src

# Output as JSON
vibecurb scan-network --json
```

**Example output:**

```
🌐 Scanning network security: ./src

❌ ERROR [logging]
   📄 api.js:15
   Console logging may expose user data
   Match: console.log(user)
   Fix: Use a structured logger with data redaction

❌ ERROR [request]
   📄 config.js:8
   Hardcoded authorization header in fetch request
   Match: fetch("/api", { headers: { Authorization: "Bearer token123" } })
   Fix: Use environment variables for tokens

⚠️ WARNING [response]
   📄 routes.js:42
   API response may expose full user object
   Match: res.json({ user: req.user })
   Fix: Select only necessary fields before sending response

📊 Summary by Category:
logging: 1
request: 1
response: 1
error-handling: 0

📊 Overall:
❌ 2 error(s) found
⚠️ 1 warning(s) found
```

### Command Aliases

```bash
vibecurb scan      # Full name
vibe scan          # Short & memorable
vc scan            # Power user shortcut

vibe scan-network  # Short alias
vc scan-network    # Power user shortcut
```

## 🤖 AI Integration

vibecurb provides security instructions for AI coding assistants:

### Supported Tools

- ✅ **Cursor** - `.cursorrules` file
- ✅ **GitHub Copilot** - `.github/copilot-instructions.md`
- ✅ **Claude** - `AI_INSTRUCTIONS.md`
- ✅ **Antigravity** - Via instructions file
- ✅ **Wildsurf** - Via instructions file
- ✅ **Any AI** - Universal instructions included

### Setup

1. Copy AI instructions to your project:

```bash
cp node_modules/vibecurb/.cursorrules ./.cursorrules
cp node_modules/vibecurb/.github/copilot-instructions.md ./.github/
```

2. AI will now:
   - Use environment variables for secrets
   - Never log sensitive data
   - Suggest vibecurb before committing

## 🛡️ Security Checklist

Before committing code, vibecurb checks for:

**Secrets:**

- [ ] No API keys in code
- [ ] No database passwords
- [ ] No private keys
- [ ] No hardcoded tokens

**Network:**

- [ ] No console.log of user data
- [ ] No auth headers in logs
- [ ] No full objects in API responses
- [ ] No stack traces in error responses

**Best Practices:**

- [ ] All secrets in .env
- [ ] .env in .gitignore
- [ ] No debugger statements
- [ ] Proper CORS configuration

## 🧪 Testing Safe Code

Use `FAKE_` prefix in tests:

```javascript
// ✅ Safe - will be ignored
const apiKey = "FAKE_API_KEY_001";
const email = "FAKE_EMAIL_001@test.com";

// ❌ Will be detected
const apiKey = "sk-live-actual-secret-key";
```

## 🏗️ Development

```bash
# Clone repository
git clone https://github.com/Mofuhidy/vibecurb.git
cd vibecurb

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run in development
npm run dev
```

## 🔧 Configuration

Create `.vibecurbrc.json`:

```json
{
  "extensions": [".js", ".ts", ".jsx", ".tsx"],
  "exclude": ["node_modules", "dist", "build"],
  "severity": "all"
}
```

## 📦 NPM Package

```bash
# Install globally
npm install -g vibecurb

# Use immediately
vibecurb scan
```

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## 📄 License

MIT © Mofuhidy

## 🙏 Acknowledgments

- Inspired by [truffleHog](https://github.com/trufflesecurity/truffleHog) and [GitGuardian](https://www.gitguardian.com/)
- Built for the vibe-coding era
- Security-first by design

---
