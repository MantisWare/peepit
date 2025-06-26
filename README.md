# PeepIt MCP: Lightning-fast macOS Screenshots for AI Agents

![PeepIt Banner](https://github.com/MantisWare/peepit/blob/main/assets/banner2.png)

[![npm version](https://badge.fury.io/js/%40mantisware%2Fpeepit-mcp.svg)](https://www.npmjs.com/package/@mantisware/peepit-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![macOS](https://img.shields.io/badge/macOS-14.0%2B-blue.svg)](https://www.apple.com/macos/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

---

# PeepIt: Because Your AI Deserves to See What You See

Ever wish your AI assistant could just *look* at your screen and get it? PeepIt is here to grant your digital sidekick the gift of sight—no magic wands required. Whether you're debugging a UI, capturing a bug in the wild, or just want to know what's lurking behind that mysterious window, PeepIt's got your back (and your screen).

## What is PeepIt?

PeepIt is a macOS-only MCP server that lets AI agents capture screenshots of your apps, windows, or the whole system—then analyze them with local or cloud-based AI models. It's like giving your AI a pair of glasses and a magnifying glass, all in one.

- **Capture screenshots** of anything: the whole screen, a single app, or that one window you can never find
- **Analyze visual content** with AI vision models (local or cloud—your call)
- **List running apps and windows** for laser-targeted captures
- **Work non-intrusively**—no window focus stealing, no workflow interruptions, no drama

## Key Features

- **🚀 Fast & Non-intrusive**: Blink and you'll miss it—PeepIt uses Apple's ScreenCaptureKit for lightning-fast screenshots, all without hijacking your window focus or interrupting your groove.
- **🎯 Smart Window Targeting**: Fuzzy matching so sharp, it'll find the right window even if you only remember half its name (we've all been there).
- **🤖 AI-Powered Analysis**: Ask questions about your screenshots and get answers from GPT-4o, Claude, or local models—because sometimes you need a second set of (robotic) eyes.
- **🔒 Privacy-First**: Prefer to keep things on the down-low? Run everything locally with Ollama, or call in the cloud cavalry only when you really need it.
- **📦 Easy Installation**: One-click install via Cursor, or just a quick npm/npx incantation—no arcane rituals required.
- **🛠️ Developer-Friendly**: Clean JSON API, TypeScript support, and logs so comprehensive you'll wonder if PeepIt is secretly writing your memoirs.

---

## Installation

### Requirements

- **macOS 14.0+** (Sonoma or later)
- **Node.js 20.0+**
- **Screen Recording Permission** (don't worry, you'll be prompted—no need to go spelunking in System Settings)

### Quick Start

#### For Cursor IDE

Or manually add to your Cursor settings:

```json
{
  "mcpServers": {
    "peepit": {
      "command": "npx",
      "args": [
        "-y",
        "@mantisware/peepit-mcp"
      ],
      "env": {
        "PEEPIT_AI_PROVIDERS": "openai/gpt-4o,ollama/llava:latest",
        "OPENAI_API_KEY": "your-openai-api-key-here"
      },
      "toolCallTimeoutMillis": 120000
    }
  }
}
```

#### For Claude Desktop

Edit your Claude Desktop configuration file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add the PeepIt configuration (copy, paste, and you're halfway to AI vision):

```json
{
  "mcpServers": {
    "peepit": {
      "command": "npx",
      "args": [
        "-y",
        "@mantisware/peepit-mcp"
      ],
      "env": {
        "PEEPIT_AI_PROVIDERS": "openai/gpt-4o,ollama/llava:latest",
        "OPENAI_API_KEY": "your-openai-api-key-here"
      }
    }
  }
}
```

Then restart Claude Desktop. (Yes, you really do have to restart it. We checked.)

### Configuration

PeepIt is as configurable as your favorite text editor. Use environment variables to tune it to your workflow:

```json
{
  "PEEPIT_AI_PROVIDERS": "openai/gpt-4o,ollama/llava:latest",
  "OPENAI_API_KEY": "your-openai-api-key-here",
  "PEEPIT_LOG_LEVEL": "debug",
  "PEEPIT_LOG_FILE": "~/Library/Logs/peepit-mcp-debug.log",
  "PEEPIT_DEFAULT_SAVE_PATH": "~/Pictures/PeepItCaptures",
  "PEEPIT_CONSOLE_LOGGING": "true",
  "PEEPIT_CLI_TIMEOUT": "30000",
  "PEEPIT_CLI_PATH": "/opt/custom/peepit"
}
```

#### Available Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PEEPIT_AI_PROVIDERS` | Who's your AI? List providers for image analysis (see [AI Analysis](#ai-analysis)). | `""` (disabled) |
| `PEEPIT_LOG_LEVEL` | How chatty should PeepIt be? (trace, debug, info, warn, error, fatal) | `info` |
| `PEEPIT_LOG_FILE` | Where to stash the logs. If the directory isn't writable, PeepIt finds a cozy temp folder. | `~/Library/Logs/peepit-mcp.log` |
| `PEEPIT_DEFAULT_SAVE_PATH` | Default directory for screenshots when you don't specify a path. | System temp directory |
| `PEEPIT_OLLAMA_BASE_URL` | Where's your Ollama API? Only needed if it's not at the usual spot. | `http://localhost:11434` |
| `PEEPIT_CONSOLE_LOGGING` | Want logs in your console? Set to `"true"` for maximum oversharing. | `"false"` |
| `PEEPIT_CLI_TIMEOUT` | How long to wait for Swift CLI magic (ms). | `30000` (30 seconds) |
| `PEEPIT_CLI_PATH` | Custom path to the Swift `peepit` CLI, if you're feeling fancy. | (uses bundled CLI) |

#### AI Provider Configuration

The `PEEPIT_AI_PROVIDERS` variable is your golden ticket to AI-powered screenshot analysis. Want PeepIt to answer questions about your screen? Just list your favorite models:

`PEEPIT_AI_PROVIDERS="openai/gpt-4o,ollama/llava:latest,anthropic/claude-3-haiku-20240307"`

Or, if you're a semicolon connoisseur:

`PEEPIT_AI_PROVIDERS="openai/gpt-4o;ollama/llava:latest;anthropic/claude-3-haiku-20240307"`

Each entry is `provider_name/model_identifier`. Supported providers: `ollama` (for local), `openai` (for the cloud), and soon, `anthropic` (for the truly adventurous).

PeepIt will try providers in order, checking for API keys or local services as needed. You can override the model per request if you're feeling particular.

### Setting Up Local AI with Ollama

Ollama brings AI vision to your desktop—no cloud required, no data leaving your Mac. (Your secrets are safe. Probably.)

#### Installing Ollama

```bash
brew install ollama
# Or download from https://ollama.ai
ollama serve
```

#### Downloading Vision Models

**For beefy machines:**

```bash
ollama pull llava:latest
ollama pull llava:7b-v1.6
ollama pull llava:13b-v1.6  # For the RAM-rich
ollama pull llava:34b-v1.6  # For the RAM-obsessed
```

**For lighter laptops:**

```bash
ollama pull qwen2-vl:7b
```

**Model Size Guide:**
- `qwen2-vl:7b` - ~4GB download, ~6GB RAM (great for mortals)
- `llava:7b` - ~4.5GB download, ~8GB RAM
- `llava:13b` - ~8GB download, ~16GB RAM
- `llava:34b` - ~20GB download, ~40GB RAM (bring snacks)

#### Configuring PeepIt with Ollama

Add Ollama to your Claude Desktop config:

```json
{
  "mcpServers": {
    "peepit": {
      "command": "npx",
      "args": [
        "-y",
        "@mantisware/peepit-mcp@beta"
      ],
      "env": {
        "PEEPIT_AI_PROVIDERS": "ollama/llava:latest"
      }
    }
  }
}
```

**For lighter machines:**
```json
{
  "mcpServers": {
    "peepit": {
      "command": "npx",
      "args": [
        "-y",
        "@mantisware/peepit-mcp@beta"
      ],
      "env": {
        "PEEPIT_AI_PROVIDERS": "ollama/qwen2-vl:7b"
      }
    }
  }
}
```

**Mix and match AI providers:**
```json
{
  "env": {
    "PEEPIT_AI_PROVIDERS": "ollama/llava:latest,openai/gpt-4o",
    "OPENAI_API_KEY": "your-api-key-here"
  }
}
```

---

## macOS Permissions

PeepIt needs a few macOS permissions to work its magic. Don't worry, it's not asking for your Netflix password.

### 1. Screen Recording Permission (Required)

**macOS Sequoia (15.0+):**
1. System Settings → Privacy & Security
2. Scroll to Screen & System Audio Recording
3. Toggle on your terminal or MCP client
4. Restart the app (yes, again)

**macOS Sonoma (14.0) and earlier:**
1. System Preferences → Security & Privacy → Privacy
2. Select Screen Recording
3. Click the lock, enter your password
4. Add your terminal or MCP client
5. Restart the app

**Apps that need permission:**
- Terminal.app
- Claude Desktop
- VS Code
- Cursor

### 2. Accessibility Permission (Optional, but nice)

**macOS Sequoia (15.0+):**
1. System Settings → Privacy & Security → Accessibility
2. Toggle on your terminal/MCP client

**macOS Sonoma (14.0) and earlier:**
1. System Preferences → Security & Privacy → Privacy
2. Select Accessibility
3. Add your terminal/MCP client

---

## Testing & Debugging

### Using MCP Inspector

Want to see PeepIt in action? Fire up the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector):

```bash
# Test with OpenAI
OPENAI_API_KEY="your-key" PEEPIT_AI_PROVIDERS="openai/gpt-4o" npx @modelcontextprotocol/inspector npx -y @mantisware/peepit-mcp

# Test with local Ollama
PEEPIT_AI_PROVIDERS="ollama/llava:latest" npx @modelcontextprotocol/inspector npx -y @mantisware/peepit-mcp
```

### Direct CLI Testing

```bash
./peepit --help
./peepit list server_status --json-output
./peepit image --mode screen --format png
peepit-mcp
```

**Expected output:**
```json
{
  "success": true,
  "data": {
    "swift_cli_available": true,
    "permissions": {
      "screen_recording": true
    },
    "system_info": {
      "macos_version": "14.0"
    }
  }
}
```

---

## Available Tools

PeepIt gives you three main tools—think of them as your AI's Swiss Army knife:

### 1. `image` - Capture Screenshots

Snap a screenshot of your Mac—screen, app, or window. Shadows and frames? Gone. (You're welcome.)

**Note:** Screen captures are always saved to files (no Base64 for giant images—your stack won't like it). If you ask for `format: "data"`, PeepIt will politely ignore you and save a PNG instead, with a gentle warning.

**Examples:**
```javascript
// Capture entire screen
await use_mcp_tool("peepit", "image", {
  app_target: "screen:0",
  path: "~/Desktop/screenshot.png"
});

// Capture a specific app window and analyze it
await use_mcp_tool("peepit", "image", {
  app_target: "Safari",
  question: "What website is currently open?",
  format: "data"
});

// Capture window by title
await use_mcp_tool("peepit", "image", {
  app_target: "Notes:WINDOW_TITLE:Meeting Notes",
  path: "~/Desktop/notes.png"
});

// Capture the frontmost window
await use_mcp_tool("peepit", "image", {
  app_target: "frontmost",
  format: "png"
});

// Capture by Process ID
await use_mcp_tool("peepit", "image", {
  app_target: "PID:663",
  path: "~/Desktop/process.png"
});
```

**Browser Helper Filtering:**
PeepIt is smart enough to avoid browser helper processes (no more "Google Chrome Helper (Renderer)" shenanigans). You'll get the real browser window, or a clear message if it's not running.

**File Naming and Path Behavior:**
- **Single capture?** Your path is used as-is.
- **Multiple captures?** PeepIt adds metadata to filenames so nothing gets overwritten.
- **Directory path?** PeepIt generates unique names for you.
- **Long filenames?** PeepIt trims them to fit macOS's 255-byte limit, keeping your emoji and non-Latin scripts intact.
- **Invalid formats?** Only PNG and JPEG are allowed. Anything else gets converted, with a friendly warning.

### 2. `list` - System Information

List running apps, windows, or check server status. Because sometimes you just need to know what's out there.

**Examples:**
```javascript
// List all running apps
await use_mcp_tool("peepit", "list", {
  item_type: "running_applications"
});

// List windows of a specific app
await use_mcp_tool("peepit", "list", {
  item_type: "application_windows",
  app: "Preview"
});

// List windows by PID
await use_mcp_tool("peepit", "list", {
  item_type: "application_windows",
  app: "PID:663"
});

// Check server status
await use_mcp_tool("peepit", "list", {
  item_type: "server_status"
});
```

### 3. `analyze` - AI Vision Analysis

Feed an image to your AI and ask it anything. (Well, almost anything.)

**Examples:**
```javascript
// Analyze with auto-selected provider
await use_mcp_tool("peepit", "analyze", {
  image_path: "~/Desktop/screenshot.png",
  question: "What applications are visible?"
});

// Force a specific provider
await use_mcp_tool("peepit", "analyze", {
  image_path: "~/Desktop/diagram.jpg",
  question: "Explain this diagram",
  provider_config: {
    type: "ollama",
    model: "llava:13b"
  }
});
```

---

## Testing

PeepIt comes with tests galore:

### TypeScript Tests
- **Unit Tests**: For the code that likes to be alone
- **Integration Tests**: For the code that plays well with others
- **Platform-Specific Tests**: Some tests need macOS and the Swift binary

```bash
npm test                # Run all tests (macOS required for full suite)
npm run test:unit       # Unit tests only (any platform)
npm run test:typescript # TypeScript-only tests (Linux-friendly)
npm run test:typescript:watch # Watch mode
npm run test:coverage   # With coverage
```

### Swift Tests
```bash
npm run test:swift      # Swift CLI tests (macOS only)
npm run test:integration # Full integration (TypeScript + Swift)
```

### Platform Support
- **macOS**: All tests
- **Linux/CI**: TypeScript-only (Swift tests are skipped)
- **Env Vars**:
  - `SKIP_SWIFT_TESTS=true`: Skip Swift tests
  - `CI=true`: Skip Swift tests automatically

---

## Troubleshooting

| Haunting | Exorcism |
|----------|----------|
| `Permission denied` during capture | Grant Screen Recording permission. Restart the app. |
| Window capture issues | Grant Accessibility permission for more reliable targeting. |
| `Swift CLI unavailable` | Make sure the `peepit` binary is present and executable. Rebuild if needed. |
| `AI analysis failed` | Check your AI provider config and API keys. Make sure local services are running. Check logs for details. |
| `Command not found: peepit-mcp` | Ensure your PATH includes npm binaries, or use the right command. |
| General weirdness | Check the logs! Set `PEEPIT_LOG_LEVEL=debug` for maximum detail. |

### Debug Mode

```bash
OPENAI_API_KEY="your-key" PEEPIT_AI_PROVIDERS="openai/gpt-4o" PEEPIT_LOG_LEVEL=debug PEEPIT_CONSOLE_LOGGING=true npx @mantisware/peepit-mcp
./peepit list server_status --json-output
```

### Getting Help
- 📚 [Documentation](./docs/)

---

## Building from Source

### Development Setup

```bash
git clone https://github.com/mantisware/peepit.git
cd peepit
npm install
npm run build
cd peepit-cli
swift build -c release
cp .build/release/peepit ../peepit
cd ..
npm link # Optional: install globally
```

### Local Development Configuration

For local dev:
```json
{
  "mcpServers": {
    "peepit_local": {
      "command": "peepit-mcp",
      "args": [],
      "env": {
        "PEEPIT_LOG_LEVEL": "debug",
        "PEEPIT_CONSOLE_LOGGING": "true"
      }
    }
  }
}
```

Or, running directly with `node`:
```json
{
  "mcpServers": {
    "peepit_local_node": {
      "command": "node",
      "args": [
        "/Users/mantisware/Projects/PeepIt/dist/index.js"
      ],
      "env": {
        "PEEPIT_LOG_LEVEL": "debug",
        "PEEPIT_CONSOLE_LOGGING": "true"
      }
    }
  }
}
```

Use absolute paths and unique server names to avoid confusion.

### AppleScript Version (Legacy)

For the old-school crowd:
```bash
osascript peepit.scpt
```
*Note: No AI analysis or MCP features in this version.*

### Manual Configuration for Other MCP Clients

```json
{
  "server": {
    "command": "node",
    "args": ["/path/to/peepit/dist/index.js"],
    "env": {
      "PEEPIT_AI_PROVIDERS": "openai/gpt-4o,ollama/llava",
      "OPENAI_API_KEY": "your-openai-api-key-here"
    }
  }
}
```

---

## Tool Documentation

### `image` - Screenshot Capture

Capture your Mac's screen and optionally analyze it. Shadows and frames are automatically banished.

**Parameters:**
- `app_target` (string, optional): Specifies the capture target. If omitted or empty, captures all screens.
    - Examples:
        - `"screen:INDEX"`: Captures the screen at the specified zero-based index (e.g., `"screen:0"`). (Note: Index selection from multiple screens is planned for full support in the Swift CLI).
        - `"frontmost"`: Captures the frontmost window of the currently active application.
        - `"AppName"`: Captures all windows of the application named `AppName` (e.g., `"Safari"`, `"com.apple.Safari"`). Fuzzy matching is used.
        - `"PID:ProcessID"`: Captures all windows of the application with the specified process ID (e.g., `"PID:663"`). Useful when multiple instances of the same app are running.
        - `"AppName:WINDOW_TITLE:Title"`: Captures the window of `AppName` that has the specified `Title` (e.g., `"Notes:WINDOW_TITLE:My Important Note"`).
        - `"AppName:WINDOW_INDEX:Index"`: Captures the window of `AppName` at the specified zero-based `Index` (e.g., `"Preview:WINDOW_INDEX:0"` for the frontmost window of Preview).
- `path` (string, optional): Base absolute path for saving the captured image(s). If `format` is `"data"` and `path` is also provided, the image is saved to this path (as a PNG) AND Base64 data is returned. If a `question` is provided and `path` is omitted, a temporary path is used for capture, and the file is deleted after analysis.
- `question` (string, optional): If provided, the captured image will be analyzed. The server automatically selects an AI provider from those configured in the `PEEPIT_AI_PROVIDERS` environment variable.
- `format` (string, optional, default: `"png"`): Specifies the output image format or data return type.
    - `"png"` or `"jpg"`: Saves the image to the specified `path` in the chosen format. For application captures: if `path` is not provided, behaves like `"data"`. For screen captures: always saves to file.
    - `"data"`: Returns Base64 encoded PNG data of the image directly in the MCP response. If `path` is also specified, a PNG file is also saved to that `path`. **Note: Screen captures cannot use this format and will automatically fall back to PNG file format.**
    - Invalid values (empty strings, null, or unrecognized formats) automatically fall back to `"png"`.
- `capture_focus` (string, optional, default: `"background"`): Controls window focus behavior during capture.
    - `"background"`: Captures without altering the current window focus (default).
    - `"foreground"`: Attempts to bring the target application/window to the foreground before capture. This might be necessary for certain applications or to ensure a specific window is captured if multiple are open.

**Behavior with `question` (AI Analysis):**
- If a `question` is provided, the tool will capture the image (saving it to `path` if specified, or a temporary path otherwise).
- This image is then sent to an AI model for analysis. The AI provider and model are chosen automatically by the server based on your `PEEPIT_AI_PROVIDERS` environment variable (trying them in order until one succeeds).
- The analysis result is returned as `analysis_text` in the response. Image data (Base64) is NOT returned in the `content` array when a question is asked.
- If a temporary path was used for the image, it's deleted after the analysis attempt.

**Output Structure (Simplified):**
- `content`: Can contain `ImageContentItem` (if `format: "data"` or `path` was omitted, and no `question`) and/or `TextContentItem` (for summaries, analysis text, warnings).
- `saved_files`: Array of objects, each detailing a file saved to `path` (if `path` was provided).
- `analysis_text`: Text from AI (if `question` was asked).
- `model_used`: AI model identifier (if `question` was asked).

For detailed parameter documentation, see [docs/spec.md](./docs/spec.md).

---

## File Naming and Path Behavior

PeepIt intelligently manages output paths to prevent file overwrites while respecting your intentions:

**Key Principle: Single vs Multiple Captures**

When you provide a specific file path (e.g., `~/Desktop/screenshot.png`), PeepIt determines whether to use it exactly or add metadata based on the capture context:

1. **Single Capture → Exact Path**
   - Capturing one specific window
   - Capturing one specific screen (when only one display exists)
   - Capturing with `app_target: "frontmost"`
   - Your path is used exactly as specified

2. **Multiple Captures → Metadata Added**
   - Capturing all windows of an app (`mode: "multi"` or multiple windows exist)
   - Capturing all screens (when multiple displays exist)
   - Capturing with no specific target (defaults to all screens)
   - Metadata is appended to prevent overwrites

**Examples:**
```javascript
// SINGLE CAPTURES - Use exact path
// ================================

// One window of Safari
await use_mcp_tool("peepit", "image", {
  app_target: "Safari",
  path: "~/Desktop/browser.png"
});
// Result: ~/Desktop/browser.png ✓

// Specific screen (when you have only one monitor)
await use_mcp_tool("peepit", "image", {
  app_target: "screen:0",
  path: "~/Desktop/myscreen.png"
});
// Result: ~/Desktop/myscreen.png ✓

// Frontmost window
await use_mcp_tool("peepit", "image", {
  app_target: "frontmost",
  path: "~/Desktop/active.png"
});
// Result: ~/Desktop/active.png ✓

// MULTIPLE CAPTURES - Add metadata
// ================================

// All windows of Safari (mode: multi)
await use_mcp_tool("peepit", "image", {
  app_target: "Safari",
  mode: "multi",
  path: "~/Desktop/browser.png"
});
// Results: ~/Desktop/browser_Safari_window_0_20250610_120000.png
//          ~/Desktop/browser_Safari_window_1_20250610_120000.png

// All screens (multiple monitors)
await use_mcp_tool("peepit", "image", {
  app_target: "screen",  // or omit app_target
  path: "~/Desktop/monitor.png"
});
// Results: ~/Desktop/monitor_1_20250610_120000.png
//          ~/Desktop/monitor_2_20250610_120000.png

// DIRECTORY PATHS - Always use generated names
// ============================================

// Directory path (note trailing slash)
await use_mcp_tool("peepit", "image", {
  app_target: "Safari",
  path: "~/Desktop/screenshots/"
});
// Result: ~/Desktop/screenshots/Safari_20250610_120000.png
```

**Long Filename Protection:**

PeepIt automatically handles filesystem limitations:
- Truncates filenames exceeding macOS's 255-byte limit
- Preserves UTF-8 multibyte characters (emoji, non-Latin scripts)
- Ensures metadata is always included when needed
- Never creates invalid filenames

**Example:**
```javascript
// Very long filename with emoji
await use_mcp_tool("peepit", "image", {
  app_target: "Safari",
  path: "~/Desktop/" + "🎯".repeat(100) + "_screenshot.png"
});
// Result: Filename safely truncated to fit 255-byte limit
//         while preserving valid UTF-8 characters
```

**Format Validation:**
- Invalid formats ("bmp", "gif", "tiff", etc.) automatically convert to PNG
- You'll receive a clear warning message when format correction occurs
- Only "png" and "jpg"/"jpeg" are valid formats

**Browser Helper Filtering:**

PeepIt automatically filters out browser helper processes when searching for common browsers (Chrome, Safari, Firefox, Edge, Brave, Arc, Opera). This prevents confusing errors when helper processes like "Google Chrome Helper (Renderer)" are matched instead of the main browser application.

**Examples:**
```javascript
// ✅ Finds main Chrome browser, not helpers
await use_mcp_tool("peepit", "image", {
  app_target: "Chrome"
});

// ❌ Old behavior: Could match "Google Chrome Helper (Renderer)"
//     Result: "no capturable windows were found" 
// ✅ New behavior: Finds "Google Chrome" or shows "Chrome browser is not running"
```

**Browser-Specific Error Messages:**
- Instead of generic "Application not found"
- Shows clear messages like "Chrome browser is not running or not found"
- Only applies to browser identifiers - other apps work normally

---

## Technical Features

- **Multi-display support**: Each monitor gets its own moment in the spotlight
- **Smart app targeting**: Fuzzy matching for app names
- **Multiple formats**: PNG, JPEG, WebP, HEIF
- **Automatic naming**: Timestamp-based, no overwrites
- **Permission checking**: No surprises
- **Application listing**: See what's running
- **Window enumeration**: List all windows for an app
- **PID targeting**: For the process-obsessed
- **Status monitoring**: Know what's active
- **Provider agnostic**: Ollama, OpenAI, and soon Anthropic
- **Natural language**: Ask questions about images
- **Configurable**: Environment-based
- **Fallback support**: Automatic failover between providers

---

## Architecture

```
PeepIt/
├── src/                      # Node.js MCP Server (TypeScript)
│   ├── index.ts             # Main MCP server entry point
│   ├── tools/               # Individual tool implementations
│   │   ├── image.ts         # Screen capture tool
│   │   ├── analyze.ts       # AI analysis tool  
│   │   └── list.ts          # Application/window listing
│   ├── utils/               # Utility modules
│   │   ├── peepit-cli.ts   # Swift CLI integration
│   │   ├── ai-providers.ts  # AI provider management
│   │   └── server-status.ts # Server status utilities
│   └── types/               # Shared type definitions
├── peepit-cli/            # Native Swift CLI
│   └── Sources/peepit/    # Swift source files
│       ├── main.swift       # CLI entry point
│       ├── ImageCommand.swift    # Image capture implementation
│       ├── ListCommand.swift     # Application listing
│       ├── Models.swift          # Data structures
│       ├── ApplicationFinder.swift   # App discovery logic
│       ├── WindowManager.swift      # Window management
│       ├── PermissionsChecker.swift # macOS permissions
│       └── JSONOutput.swift        # JSON response formatting
├── package.json             # Node.js dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

---

## Technical Details

### JSON Output Format
The Swift CLI outputs structured JSON when called with `--json-output`:

```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "app_name": "Safari",
        "bundle_id": "com.apple.Safari", 
        "pid": 1234,
        "is_active": true,
        "window_count": 2
      }
    ]
  },
  "debug_logs": ["Found 50 applications"]
}
```

### MCP Integration
The Node.js server provides:
- Schema validation via Zod
- Proper MCP error codes
- Structured logging via Pino
- Full TypeScript type safety

### Security
PeepIt respects macOS security:
- Checks permissions before operations
- Graceful handling of missing permissions
- Clear guidance for permission setup

---

## Development

### Testing Commands
```bash
./peepit list apps --json-output | head -20
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js
```

### Building
```bash
npm run build
cd peepit-cli && swift build
```

---

## Known Issues

- **FileHandle warning**: Non-critical Swift warning about TextOutputStream conformance
- **AI Provider Config**: Requires `PEEPIT_AI_PROVIDERS` environment variable for analysis features

---

## License

MIT License - see LICENSE file for details.

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Author

Created by [Peter Steinberger](https://mantisware.com) - [@mantisware](https://github.com/mantisware)

Read more about PeepIt's design and implementation in the [blog post](https://mantisware.com/posts/peepit-mcp-screenshots-so-fast-theyre-paranormal/).
