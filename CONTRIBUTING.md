# Contributing to Vanitas

First off, thank you for considering contributing to Vanitas!

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Browser/OS** information

### Suggesting Features

Feature suggestions are welcome! Please:

- Check if the feature has already been suggested
- Provide a clear description of the feature
- Explain why it would be useful
- Consider potential implementation approaches

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting (`npm run lint`)
5. Build the project (`npm run build`)
6. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

### Development Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd vanitas

# Install dependencies
npm install

# Build the worker
npm run build:worker

# Start development server
npm run dev
```

### Project Structure

```
src/
├── app/           # Next.js pages (/, /sol, /evm, /btc, /tron, docs)
├── components/    # React components
├── hooks/         # Custom React hooks per forge
├── lib/           # Encoding, difficulty, shared utilities
├── types/         # TypeScript types
└── workers/       # Web Worker sources (built into public/*-worker.js)
```

Forges: Solana (Ed25519), EVM (secp256k1 + keccak), Bitcoin (legacy + SegWit), Tron (Base58Check).

## Security

For security vulnerabilities, please see [SECURITY.md](SECURITY.md). Do NOT open public issues for security problems.

## Questions?

Feel free to open a discussion on GitHub if you have questions!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
