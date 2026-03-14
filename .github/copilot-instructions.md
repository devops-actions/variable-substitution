# Copilot Instructions

This repo is a fork of the archived [Microsoft variable-substitution](https://github.com/microsoft/variable-substitution) repository, maintained to keep it up to date with modern Node.js versions. When proposing changes and PRs, target this repo — not the upstream fork.

## What this action does

A GitHub Action that substitutes environment variables into **XML, JSON, and YAML** configuration files. The `files` input accepts a comma-separated glob list. Environment variables set in the workflow `env:` block are matched against keys in the target files (with dot-notation support for nested keys, e.g. `data.ConnectionString`).

For XML, substitution is scoped to: `applicationSettings`, `appSettings`, `connectionStrings`, and `configSections` elements only.

## Build & test

```bash
npm run build        # Compile TypeScript → lib/
npm test             # Build then run all tests
npm run coverage     # Build then run tests with NYC coverage report
```

Run a single test file:
```bash
npx mocha "lib/Tests/jsonVariableSubstitution.test.js"
npx mocha "lib/Tests/xmlVariableSubstituttion.test.js"
npx mocha "lib/Tests/variableSubstitution.test.js"
```

Note: compiled output goes to `lib/` — tests always run against `lib/`, not `src/`. The `pretest` hook runs `npm run build` automatically.

## Architecture

Source is in `src/`, compiled to `lib/` by `tsc`. `node_modules` is committed to the repo (do not add it to `.gitignore`).

| File | Role |
|------|------|
| `src/variableSubstitution.ts` | Entry point — reads the `files` input, splits by file type, orchestrates substitution |
| `src/operations/envVariableUtility.ts` | Builds a hierarchical tree from `process.env` for dot-notation key matching |
| `src/operations/jsonVariableSubstitutionUtility.ts` | Handles both JSON and YAML; preserves original value types (number, boolean, object) |
| `src/operations/xmlVariableSubstitution.ts` | XML substitution using token placeholders, scoped to specific config elements |
| `src/operations/xmlDomUtility.ts` | XML parsing via `ltx` library; builds tag name lookup table |
| `src/operations/utility.ts` | File discovery using `minimatch` glob patterns |
| `src/operations/fileEncodingUtility.ts` | BOM detection; supports UTF-8 (with/without BOM) and UTF-16LE |
| `src/Tests/` | Mocha tests + fixture files in `src/Tests/Resources/` |

## Key conventions

**ESM with explicit `.js` extensions**: The project uses `"type": "module"` and `NodeNext` module resolution. All imports in `src/` must use `.js` extensions even though the source files are `.ts`:
```typescript
import { utility } from './utility.js';
```

**TypeScript is not strict**: `tsconfig.json` has `"strict": false`. Implicit `any` is allowed; don't add strict-mode fixes unless they're directly related to a change.

**Test patterns (Mocha + Sinon)**:
- Stub `EnvTreeUtility.getEnvVarTree()` to inject mock environment in JSON/YAML tests
- Use `sinon.stub(process, 'env')` is NOT used — tests set `process.env` values directly and clean up in `afterEach`
- XML tests do real file I/O with `src/Tests/Resources/` fixtures and compare against `*_Expected.*` files
- Assertions use Node's built-in `assert/strict` module

**Type-aware JSON/YAML substitution**: When replacing a value, the substitution preserves the original type — a JSON `number` field stays a number, `boolean` stays a boolean, `object` fields attempt `JSON.parse` on the env var value.

**Runtime**: Node 22, `@actions/core` v3 (ESM-compatible). Use `core.getInput()`, `core.setFailed()`, `core.debug()` for all action I/O.
