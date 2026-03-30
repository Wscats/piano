# Refactor Notes — piano

> Automated deep refactoring applied by [refactor-claude-opus](https://github.com/wscats).

## Summary of Changes

### Configuration

| File | Purpose |
|------|---------|
| `.editorconfig` | Consistent coding style across editors |
| `.gitignore` | Comprehensive ignore patterns |
| `.prettierrc` | Code formatting (Prettier) |
| `.github/workflows/ci.yml` | CI/CD with Node 18/20/22 |
| `.github/dependabot.yml` | Automated dependency + CI updates |
| `.eslintrc.json` | Strict ESLint rules |
| `jest.config.js` | Jest with 80% coverage threshold |
| `tsconfig.json` | TypeScript strict mode |

### Utility Modules

| Module | Description |
|--------|-------------|
| `src/utils/security.ts` | XSS prevention, path validation, rate limiting |
| `src/utils/error-handling.ts` | AppError class, Result type, safe wrappers |
| `src/utils/performance.ts` | Debounce, throttle, memoize, retry |

### JavaScript Modernization

- `var` → `const`/`let`
- `==` → `===` (strict equality)
- Added `'use strict'` to non-module files

### TypeScript Improvements

- `any` → `unknown` for safer type handling
- Strict equality enforcement

## Refactoring Principles

1. **TypeScript** — strict mode, `noUncheckedIndexedAccess`
2. **Error handling** — Result type pattern, unified AppError class
3. **Security** — XSS prevention, input validation, path traversal protection
4. **Performance** — debounce/throttle, memoization, retry with backoff
5. **Testing** — 80%+ coverage target, unit + integration tests
6. **CI/CD** — GitHub Actions with Node 18/20/22 matrix

## Running Locally

```bash
npm install
npm run lint          # ESLint
npm run format        # Prettier
npm run type-check    # TypeScript
npm test              # Jest
npm run build         # Build (if applicable)
```

