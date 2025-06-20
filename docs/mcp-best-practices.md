# MCP Best Practices: How to Build Tools Like a Pro (and Not Lose Your Mind)

*Last updated: May 26, 2025*

## I. General Tool Configuration & Behavior

1. **Sensible Defaults:** Every environment variable should have a smart default. Out-of-the-box should mean "it just works."
2. **Dynamic Versioning:** Your tool's version should be read from `package.json` (or equivalent)—never hardcoded. Show it off in your tool's description.
3. **Descriptions That Actually Help:**
   - **Tool Titles:** Make them human-friendly and descriptive.
   - **Parameter Descriptions:** Every parameter gets a clear, concise explanation.
   - **Optional/Required:** Spell it out. Don't make users guess.
   - **Defaults:** If a parameter is optional, say what the default is.
   - (Pro tip: Hovering in Cursor or using MCP Inspector should reveal all this.)
4. **Lenient Parsing, Strict Schema:** Accept common variations (e.g., `path` vs. `project_path`) even if your schema is stricter. Be forgiving in execution, but clear in your docs.
5. **Helpful Errors:** If something goes wrong, return a message that helps the user fix it. No cryptic stack traces, please.
6. **Misconfigurations ≠ Crashes:** If the user messes up their config, don't crash—explain what's wrong and how to fix it.
7. **No Noisy Output:** Don't write to `stdio` during normal operation. Use file-based logging for all the behind-the-scenes action.
8. **The `info` Command:**
   - At least one tool should have an `info` subcommand.
   - It should list:
     - The tool's version
     - Status of native dependencies
     - Any config issues or missing env vars

## II. Logging (Pino)

1. **File Logger by Default:** Use Pino to log to a file in the system log directory (e.g., `~/Library/Logs/`). Make the path configurable via `[ProjectName]_LOG_FILE`.
2. **Log Path Resilience:**
   - Auto-create parent directories if needed.
   - If the log file can't be written, fall back to a temp directory.
3. **Configurable Log Level:** Set log level via `[ProjectName]_LOG_LEVEL` (case-insensitive).
4. **Optional Console Logging:** `[ProjectName]_CONSOLE_LOGGING=true` enables console logs too.
5. **Flush Before Exit:** Always flush the logger before your process exits. Don't lose those last words!

## III. Code, Dependencies & Build

1. **Keep Dependencies Fresh:** Use the latest stable versions. (The release script will nag you if you don't.)
2. **No Linter or TypeScript Errors:** Zero tolerance for red squiggles.
3. **File Size Discipline:** No file over 500 lines. Under 300 is even better.
4. **Run Compiled Code:** Always use the compiled JS output (e.g., from `dist/`).
5. **Shebangs:** If your JS is meant to be run directly, add the right shebang (`#!/usr/bin/env node`).
6. **Minimal NPM Package:** Only ship what's needed: `dist/`, native bits, `README.md`, and `LICENSE`.

## IV. Testing

1. **Use Vitest:** All tests should run on Vitest.
2. **Comprehensive TypeScript Tests:** Don't skimp—cover the TypeScript layer thoroughly.
3. **End-to-End (E2E) Tests:** Validate the whole setup, even if you have to run some tests locally due to macOS permissions.
4. **NPM Scripts:**
   - `npm run prepare-release` runs the full test suite.
   - `npm run inspector` launches the MCP Inspector for manual poking and prodding.

## V. Native Binary Rules (If You Have One)

1. **Universal Binaries:** Must support both Apple Silicon and Intel, and the current + previous macOS versions.
2. **Tiny Binaries:** Use compiler/linker flags to keep the binary lean.
3. **Native Test Suite:** Use Swift's native testing tools for full coverage.
4. **Custom Path Support:** Let users set a custom path to the native binary via env var.
5. **Error Communication:** Use `errno` (or similar) to pass native errors back to TypeScript and the user.
6. **Version Sync:** Native CLI and MCP tool must share a version, injected at build time.
7. **Native Code Quality:**
   - No SwiftLint issues
   - Formatted with SwiftFormat
   - No analyzer warnings
8. **JSON Mode:** Native binary must be able to speak JSON to the TypeScript server, including debug logs if requested.
9. **CLI Help:** Respond to `--help` with a clear, helpful message.
10. **Argument Parsing:** Use a robust parser (e.g., `swift-argument-parser`).
11. **Single File Distribution:** If possible, distribute as a single, statically linked binary for easy installs.

## VI. Release Checklist (scripts/prepare-release.js)

*The release script is your best friend. It checks everything below and stops at the first sign of trouble.*

**Git & Version Control:**
- On the right branch?
- No uncommitted changes?
- Synced with origin?
- Version not already published?
- `package.json` and `package-lock.json` in sync?
- Changelog updated?

**Code Quality & Security:**
- Dependencies installed?
- No outdated packages?
- No critical/high vulnerabilities?
- TypeScript compiles?
- TypeScript tests pass?
- Declarations generated?
- Clean build?
- Swift analyze/format/lint/tests (if native)?
- No build warnings?

**Binary & CLI Validation (If Native):**
- Swift CLI commands work (help, version, etc.)?
- Error handling tested?
- JSON output valid?
- Binary is executable and universal?

**Package Validation:**
- Required fields in `package.json`?
- Package under 2MB?
- Executable permissions set?
- All critical files included?
- MCP server passes smoke test?
- Full integration tests pass?

*Pro tip: Always release with a `beta` tag first. Test with `npx [packageName]@beta install` before going wide!*