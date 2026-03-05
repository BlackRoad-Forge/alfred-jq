# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | Yes                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email the maintainer or use GitHub's private vulnerability reporting
3. Include steps to reproduce and potential impact
4. Allow reasonable time for a fix before public disclosure

## Security Measures

- All GitHub Actions are pinned to commit hashes
- Dependabot monitors for dependency vulnerabilities
- CodeQL analysis runs on every push and PR
- Gitleaks scans for accidentally committed secrets
- The Cloudflare Worker validates and limits input size
