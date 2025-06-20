# Releasing PeepIt MCP: The Art of a Flawless Launch 🚀

Ready to unleash a new version of `@mantisware/peepit-mcp`? This guide will walk you through the release process—no drama, just a smooth, professional (and maybe a little fun) journey from code to npm.

## Automated Release Preparation: Your Pre-flight Checklist

Before you even think about hitting publish, let the robots do the heavy lifting:

```bash
npm run prepare-release
```

This script is your pre-release pit crew. It checks:
- **Git Status**: Are you on `main` with a clean slate?
- **package.json Health**: All required fields present and correct?
- **Dependencies**: No stragglers or outdated packages?
- **Security**: `npm audit` for vulnerabilities—because safety first.
- **Version Check**: Is this version new to npm?
- **Version Consistency**: `package.json` and `package-lock.json` in perfect harmony?
- **Changelog**: Is there a shiny new entry for this version?
- **TypeScript**: Compiles and tests pass?
- **Type Declarations**: `.d.ts` files are present and accounted for?
- **Swift**: Format, lint, and test like a pro.
- **Build Verification**: Everything builds, nothing breaks.
- **Package Size**: Under 2MB? No bloat allowed.
- **MCP Server Smoke Test**: Can the server handle a simple JSON-RPC request?

If you pass all checks, you're cleared for manual pre-release steps.

## Manual Pre-Release Steps: The Human Touch

1. **Version Bump:**
   - Pick your new semantic version (e.g., `1.0.0-beta.3`, `1.0.0`, `1.1.0`).
   - Update `package.json` accordingly.

2. **Docs, Docs, Docs:**
   - `README.md`: Up-to-date and fabulous?
   - `docs/spec.md`: Reflects any tool or server changes?
   - Any other docs: Don't leave them behind!

3. **Changelog Glory:**
   - Add a new section for your version in `CHANGELOG.md` (e.g., `## [1.0.0-beta.3] - YYYY-MM-DD`).
   - List what's new, what's fixed, and what's gone.
   - Swap `YYYY-MM-DD` for today's date.

4. **Run the Release Script Again:**
   - `npm run prepare-release`—just to be sure.
   - Fix anything it complains about.

5. **Test Locally:**
   - **MANDATORY:** Compile and run all tests.
   - `cd peepit-cli && swift test` for Swift-side sanity.
   - Optionally, test local-only features:
     - `cd peepit-cli/TestHost && swift run`
     - `cd peepit-cli && RUN_LOCAL_TESTS=true swift test --filter LocalIntegration`
   - Don't skip this—local quirks can slip past CI!

6. **Commit Your Brilliance:**
   - `git add .`
   - `git commit -m "Prepare release vX.Y.Z"`

## Publishing to NPM: Showtime

1. **Dry Run:**
   - See what you're about to ship:
   - `npm publish --access public --tag <your_tag> --dry-run`
     - Use `beta`, `rc`, or `latest` as appropriate.
     - Make sure only the right files are included: `dist/`, `peepit`, `package.json`, `README.md`, `CHANGELOG.md`, `LICENSE`.

2. **Go Live:**
   - If the dry run looks good, it's time:
   - `npm publish --access public --tag <your_tag>`

## After the Launch: Victory Lap

1. **Tag It:**
   - `git tag vX.Y.Z`

2. **Push the Tag:**
   - `git push origin vX.Y.Z`

3. **GitHub Release (Optional, but Fancy):**
   - Draft a new release in GitHub's "Releases" section.
   - Use your new tag, paste in the changelog, and (optionally) attach binaries or the npm package.

4. **Spread the Word:**
   - Announce in your favorite channels—Slack, Twitter, your blog, or just to your dog.

---

**Pro Tip:** The `prepublishOnly` script in `package.json` runs `npm run build:all` before publishing. You literally can't forget to build. (You're welcome.) 