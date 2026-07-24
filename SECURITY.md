# Security Policy

## Our Commitment

Vanitas takes security seriously. We designed this tool with a security-first mindset:

- **100% Client-Side**: All key generation happens in your browser
- **Zero Server Storage**: Private keys never touch our servers
- **Open Source**: All code is auditable on GitHub
- **Zero Data Storage**: No databases, no tracking, no analytics
- **Live Audit**: Run [8 automated security checks](https://vanitas.fun/audit) directly in your browser

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| 0.9.x   | :x:                |
| < 0.9   | :x:                |

## Reporting a Vulnerability

We appreciate responsible disclosure of security vulnerabilities.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Prefer a private report via [GitHub Security Advisories](https://github.com/bytebrox/vanitas/security/advisories/new)
3. If advisories are unavailable, contact us through the process described on [vanitas.fun/security](https://vanitas.fun/security)

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution Target**: Within 30 days (depending on severity)
- Coordinated disclosure window: typically 90 days after acknowledgment

### What to Expect

- We will acknowledge your report promptly
- We will investigate and validate the issue
- We will keep you informed of our progress
- We will credit you (unless you prefer anonymity)

## Security Measures

### HTTP Security Headers
| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | strict | Prevents XSS, data injection |
| Strict-Transport-Security | max-age=31536000 | Forces HTTPS (HSTS) |
| X-Frame-Options | DENY | Prevents clickjacking |
| X-Content-Type-Options | nosniff | Prevents MIME sniffing |

### Cryptography
| Component | Implementation | Standard |
|-----------|----------------|----------|
| Key Generation | Native Web Crypto API | Ed25519 |
| Random Numbers | crypto.getRandomValues() | Hardware-backed CSPRNG |
| Entropy | 256 bits | Industry standard |
| Encoding | Base58 | Solana compatible |

### Key Security Check

After each key generation, we perform real-time verification:
- **Entropy Level**: Confirms 256-bit entropy
- **CSPRNG**: Verifies cryptographically secure RNG
- **Chi-Square Test**: Statistical randomness verification
- **Distribution**: Ensures uniform byte distribution

## Scope

### In Scope
- vanitas.fun website
- API endpoints
- GitHub repository code
- Client-side key generation

### Out of Scope
- Third-party services (Vercel, GitHub)
- Social engineering
- DoS/DDoS attacks
- Physical security

## Bug Bounty

We don't currently have a formal bug bounty program, but we appreciate and acknowledge security researchers who help improve our security.

## Contact

- Private vulnerability reports: https://github.com/bytebrox/vanitas/security/advisories/new
- Security overview: https://vanitas.fun/security
- Live in-browser audit: https://vanitas.fun/audit
