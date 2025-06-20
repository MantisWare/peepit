## PeepIt: The Full & Final Spec (v1.0.0-beta.17)

Welcome to the PeepIt spec—a document so detailed, even your AI will want to read it twice. Here's everything you (and your code) need to know about how PeepIt works, why it works, and how to make it do your bidding.

---

### Project Vision
PeepIt is your macOS utility for AI-powered screen captures, image analysis, and window/app queries. It's a Node.js MCP server on the outside, a native Swift CLI on the inside, and a privacy-first, shadow-banning, window-finding, screenshot wizard all around.

---

## Core Components

1. **Node.js/TypeScript MCP Server (`peepit-mcp`)**
   - NPM package: `peepit-mcp` (GitHub: `peepit`).
   - Uses `@modelcontextprotocol/sdk` for MCP magic.
   - Exposes three main tools: `image`, `analyze`, `list`.
   - Talks to the Swift CLI, parses its JSON, and handles all AI provider calls (Ollama, OpenAI, etc.).
   - Handles logging (with `pino`), file management, and all the glue logic.
2. **Swift CLI (`peepit`)**
   - Universal macOS binary (arm64 + x86_64).
   - Handles all the real macOS work: screenshots, app/window listing, fuzzy matching.
   - Outputs structured JSON (with debug logs) via `--json-output`.
   - Bundled at the root of the NPM package.

---

## I. Node.js/TypeScript MCP Server (`peepit-mcp`)

### A. Project Setup & Distribution
- **Language:** Node.js (LTS), TypeScript (latest).
- **NPM:** All the usual suspects in `package.json` (see original for full details).
- **Distribution:** Published to NPM, installable globally or via `npx`.
- **Swift CLI Location:**
  - Checks `PEEPIT_CLI_PATH` env var first.
  - Falls back to bundled binary if unset/invalid.

### B. Server Initialization & Configuration
- **Imports:** MCP SDK, pino, Node.js built-ins.
- **Server Info:** Name/version from `package.json`.
- **Capabilities:** Advertises `tools`.
- **Logging:**
  - File-based by default (configurable path).
  - Log level via `PEEPIT_LOG_LEVEL`.
  - Optional console logging for devs.
  - No rogue `console.log`—all logs go through pino.
- **Environment Variables:**
  - `PEEPIT_AI_PROVIDERS`: Comma/semicolon-separated list of `provider/model` pairs (e.g., `openai/gpt-4o,ollama/llava:latest`).
  - `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.
  - `PEEPIT_OLLAMA_BASE_URL`: Where to find your local Ollama.
  - `PEEPIT_LOG_LEVEL`, `PEEPIT_LOG_FILE`, `PEEPIT_DEFAULT_SAVE_PATH`, `PEEPIT_CONSOLE_LOGGING`, `PEEPIT_CLI_PATH`, `PEEPIT_CLI_TIMEOUT`.
- **Server Status Reporting:**
  - Generates a status string with name, version, and configured AI providers.
  - Appends this to tool descriptions and exposes via `list` tool (`item_type: "server_status"`).
- **Tool Registration:** Registers `image`, `analyze`, `list` with Zod schemas and handlers.
- **Transport:** Uses `StdioServerTransport`.
- **Shutdown:** Graceful on SIGINT/SIGTERM.

### C. MCP Tool Specs & Handler Logic

#### General Handler Pattern
1. Validate input with Zod.
2. Build Swift CLI args (always include `--json-output`).
3. Log the command at debug level.
4. Spawn the Swift CLI, capture output, apply timeout.
5. Log any `stderr` as warnings.
6. On close/timeout:
   - Timeout? Log and return MCP error.
   - Nonzero exit or bad output? Log and return MCP error, mapping exit codes to friendly messages.
   - Success? Parse JSON, log debug logs, relay errors or build a success response.
7. Augment response with server status if needed.
8. Send MCP response.

---

### Tool 1: `image`

**Description:**
Captures macOS screen content and (optionally) analyzes it. Target the whole screen, a specific app, or a window. Save to file, return Base64, or both. Ask a question and get AI-powered analysis. Shadows/frames? Gone.

**Input Schema:**
```typescript
z.object({
  app_target: z.string().optional().describe(
    "Optional. Specifies the capture target. Examples:\n" +
    "- Omitted/empty: All screens.\n" +
    "- 'screen:INDEX': Specific display (e.g., 'screen:0').\n" +
    "- 'frontmost': All windows of the current foreground app.\n" +
    "- 'AppName': All windows of 'AppName'.\n" +
    "- 'PID:ProcessID': All windows of the application with the specified process ID (e.g., 'PID:663').\n" +
    "- 'AppName:WINDOW_TITLE:Title': Window of 'AppName' with 'Title'.\n" +
    "- 'AppName:WINDOW_INDEX:Index': Window of 'AppName' at 'Index'."
  ),
  path: z.string().optional().describe(
    "Optional. Base absolute path for saving captured image(s). " +
    "If this path points to a directory, the Swift CLI will generate unique filenames inside it. " +
    "If this path points to a file: " +
    "- Single capture: Uses the exact path as-is. " +
    "- Multiple captures: Appends metadata (app name, window index, timestamp) to prevent overwrites. " +
    "Very long filenames are automatically truncated to stay within macOS's 255-byte limit while preserving UTF-8 characters. " +
    "If this path is omitted, a temporary directory is created for the capture. " +
    "The path(s) of the saved file(s) are always returned in the 'saved_files' output."
  ),
  question: z.string().optional().describe(
    "Optional. If provided, the captured image will be analyzed. " +
    "The server automatically selects an AI provider from 'PEEPIT_AI_PROVIDERS'."
  ),
  format: z.enum(["png", "jpg", "data"]).optional().default("png").describe(
    "Output format. 'png' or 'jpg' save to 'path' (if provided). " +
    "'data' returns Base64 encoded PNG data inline; if 'path' is also given, saves a PNG file to 'path' too. " +
    "For application window captures: If 'path' is not given, 'format' defaults to 'data' behavior (inline PNG data returned). " +
    "For screen captures: Cannot use 'data' format due to large image sizes causing JavaScript stack overflow. " +
    "Screen captures always save to files (temp directory if no path specified) with automatic PNG format fallback."
  ),
  capture_focus: z.enum(["background", "foreground"])
    .optional().default("background").describe(
      "Optional. Focus behavior. 'background' (default): capture without altering window focus. " +
      "'foreground': bring target to front before capture."
    )
})
```

**Handler Logic Highlights:**
- Parses `app_target` to build Swift CLI args.
- Handles browser helper filtering (no more Chrome Helper confusion).
- Handles `format` and `path` logic:
  - Screen captures + `format: "data"`? Auto-fallback to PNG file, with a warning.
  - `format: "data"` + `path`? Save file and return Base64.
  - `format: "png"`/`"jpg"` + `path`? Save file only.
  - `question`? Capture, analyze, and return only the answer (no Base64 image).
- Handles file naming, metadata, and long filename protection.
- Handles multiple captures (adds metadata to filenames).
- Handles invalid formats (auto-converts to PNG, warns user).

**Output Structure:**
- `content`: Array of images (Base64) and/or text (summaries, warnings, analysis, file paths).
- `saved_files`: Array of saved file paths and metadata.
- `analysis_text`: AI answer (if `question` was asked).
- `model_used`: Which AI model did the work.
- `_meta`: Backend error codes, analysis errors, etc.

---

### Tool 2: `analyze`

**Description:**
Analyzes an image file using a configured AI model (Ollama, OpenAI, etc.) and returns a textual answer. Provider/model selection is governed by env vars and client overrides.

**Input Schema:**
```typescript
z.object({
  image_path: z.string().describe("Required. Absolute path to image file (.png, .jpg, .webp) to be analyzed."),
  question: z.string().describe("Required. Question for the AI about the image."),
  provider_config: z.object({
    type: z.enum(["auto", "ollama", "openai"]).default("auto").describe("AI provider. 'auto' uses server's PEEPIT_AI_PROVIDERS ENV preference."),
    model: z.string().optional().describe("Optional. Model name. If omitted, uses model from server's AI_PROVIDERS for chosen provider, or an internal default for that provider.")
  }).optional().describe("Optional. Explicit provider/model. Validated against server's PEEPIT_AI_PROVIDERS.")
})
```

**Handler Logic Highlights:**
- Validates image path and extension.
- Reads `PEEPIT_AI_PROVIDERS` and parses available providers/models.
- Determines provider/model based on input or auto-selection.
- Checks for provider availability (API keys, local service running, etc.).
- Reads image, sends to AI, returns answer and model used.
- Handles errors with clear messages.

---

### Tool 3: `list`

**Description:**
Lists running applications, windows, or server status.

**Input Schema:**
```typescript
z.object({
  item_type: z.enum(["running_applications", "application_windows", "server_status"]).describe("What to list: running apps, windows, or server status."),
  app: z.string().optional().describe("Optional. App name or PID for window listing.")
})
```

**Handler Logic Highlights:**
- Lists all running apps, windows for a given app/PID, or server status.
- Handles fuzzy matching and PID targeting.
- Returns structured lists with all relevant metadata.

---

## Swift CLI (`peepit`): The Mac Whisperer
- Handles all macOS system calls: screenshots, app/window listing, fuzzy matching.
- Outputs structured JSON (with debug logs) via `--json-output`.
- Filters out browser helpers for Chrome, Safari, etc.
- Handles permission checks, error codes, and all the gnarly details.

---

## File Naming, Path, and Format Logic: The Fine Print
- **Single vs. Multiple Captures:**
  - Single: Uses your path as-is.
  - Multiple: Adds metadata to filenames to prevent overwrites.
- **Directory Paths:** Always generates unique names inside the directory.
- **Long Filenames:** Truncates to 255 bytes, preserves UTF-8.
- **Invalid Formats:** Converts to PNG, warns you.
- **Browser Helper Filtering:** No more "Chrome Helper" confusion—only real browser windows are captured.

---

## Error Handling & Output
- All errors are mapped to friendly, actionable messages.
- Backend error codes and details are included in `_meta`.
- Warnings and info are returned as `TextContentItem`s.

---

## Security & Logging
- Checks permissions before every operation.
- Logs everything (to file, not stdio).
- No sensitive data leaves your machine unless you ask for cloud AI analysis.

---

## Development & Testing
- TypeScript and Swift tests for everything.
- Full integration tests.
- Release script checks all the things.

---

## That's a Wrap
If you made it this far, you're ready to wield PeepIt like a pro. For even more detail, see the original spec or the code itself. Happy capturing!
