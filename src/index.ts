#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import pino from "pino";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import fs from "fs/promises";

import {
  imageToolHandler,
  imageToolSchema,
  analyzeToolHandler,
  analyzeToolSchema,
  listToolHandler,
  listToolSchema,
} from "./tools/index.js";
import { generateServerStatusString } from "./utils/server-status.js";
import { initializeSwiftCliPath } from "./utils/peepit-cli.js";
import { zodToJsonSchema } from "./utils/zod-to-json-schema.js";
import { ToolResponse } from "./types/index.js";
import { z } from "zod";

// Get package version and determine package root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // This will be dist/
const packageRootDir = path.resolve(__dirname, ".."); // Moves from dist/ to package root
const packageJsonPath = path.join(packageRootDir, "package.json");
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
const SERVER_VERSION = packageJson.version;

// Initialize the Swift CLI Path once
initializeSwiftCliPath(packageRootDir);

// No longer need to track initial status display

// Initialize logger with fallback support
const baseLogLevel = (process.env.PEEPIT_LOG_LEVEL || "info").toLowerCase();
const defaultLogPath = path.join(os.homedir(), "Library/Logs/peepit-mcp.log");
const fallbackLogPath = path.join(os.tmpdir(), "peepit-mcp.log");
let logFile = process.env.PEEPIT_LOG_FILE || defaultLogPath;

// Test if the log directory is writable
const logDir = path.dirname(logFile);
try {
  // Try to create the directory if it doesn't exist
  await fs.mkdir(logDir, { recursive: true });
  // Test write access by creating a temp file
  const testFile = path.join(logDir, `.peepit-test-${Date.now()}`);
  await fs.writeFile(testFile, "test");
  await fs.unlink(testFile);
} catch (_error) {
  // If we can't write to the configured/default location, fall back to temp directory
  if (logFile !== fallbackLogPath) {
    logFile = fallbackLogPath;
    // We'll log this error after the logger is initialized
  }
}

const transportTargets = [];

// Always add file transport
transportTargets.push({
  level: baseLogLevel, // Explicitly set level for this transport
  target: "pino/file",
  options: {
    destination: logFile,
    mkdir: true, // Ensure the directory exists
  },
});

// Conditional console logging for development
if (process.env.PEEPIT_CONSOLE_LOGGING === "true") {
  transportTargets.push({
    level: baseLogLevel, // Explicitly set level for this transport
    target: "pino-pretty",
    options: {
      destination: 2, // stderr
      colorize: true,
      translateTime: "SYS:standard", // More standard time format
      ignore: "pid,hostname",
    },
  });
}

const logger = pino(
  {
    name: "peepit-mcp",
    level: baseLogLevel, // Overall minimum level
  },
  pino.transport({ targets: transportTargets }),
);

// Tool context for handlers
const toolContext = { logger };

// Create MCP server using the low-level API
const server = new Server(
  {
    name: "peepit-mcp",
    version: SERVER_VERSION,
    description: "PeepIt MCP Server",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Set up request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Generate server status string to append to tool descriptions
  const serverStatus = generateServerStatusString(SERVER_VERSION);
  const statusSuffix = `\n${serverStatus}`;

  return {
    tools: [
      {
        name: "image",
        description: `Captures macOS screen content and optionally analyzes it. \
Targets can be entire screen, specific app window, or all windows of an app (via app_target). \
Supports foreground/background capture. Output via file path or inline Base64 data (format: "data"). \
If a question is provided, image is analyzed by an AI model (auto-selected from PEEPIT_AI_PROVIDERS). \
Window shadows/frames excluded. ${serverStatus}`,
        inputSchema: zodToJsonSchema(imageToolSchema),
      },
      {
        name: "analyze",
        description:
`Analyzes a pre-existing image file from the local filesystem using a configured AI model.

This tool is useful when an image already exists (e.g., previously captured, downloaded, or generated) and you 
need to understand its content, extract text, or answer specific questions about it.

Capabilities:
- Image Understanding: Provide any question about the image (e.g., "What objects are in this picture?", 
  "Describe the scene.", "Is there a red car?").
- Text Extraction (OCR): Ask the AI to extract text from the image (e.g., "What text is visible in this screenshot?").
- Flexible AI Configuration: Can use server-default AI providers/models or specify a particular one per call 
  via 'provider_config'.

Example:
If you have an image '/tmp/chart.png' showing a bar chart, you could ask:
{ "image_path": "/tmp/chart.png", "question": "Which category has the highest value in this bar chart?" }
The AI will analyze the image and attempt to answer your question based on its visual content.` +
          statusSuffix,
        inputSchema: zodToJsonSchema(analyzeToolSchema),
      },
      {
        name: "list",
        description:
`Lists various system items on macOS, providing situational awareness.

Capabilities:
- Running Applications: Get a list of all currently running applications (names and bundle IDs).
- Application Windows: For a specific application (identified by name or bundle ID), list its open windows.
  - Details: Optionally include window IDs, bounds (position and size), and whether a window is off-screen.
  - Multi-window apps: Clearly lists each window of the target app.
- Server Status: Provides information about the PeepIt MCP server itself (version, configured AI providers).

Use Cases:
- Agent needs to know if 'Photoshop' is running before attempting to automate it.
  { "item_type": "running_applications" } // Agent checks if 'Photoshop' is in the list.
- Agent wants to find a specific 'Notes' window to capture.
  { "item_type": "application_windows", "app": "Notes", "include_window_details": ["ids", "bounds"] }
  The agent can then use the window title or ID with the 'image' tool.` +
          statusSuffix,
        inputSchema: zodToJsonSchema(listToolSchema),
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  logger.debug({ toolName: name, args }, "Tool call received");

  let response: ToolResponse; // To store the raw response from tool handlers

  try {
    switch (name) {
      case "image": {
        // Store original format before validation
        const originalFormat = (args as any)?.format;
        const validatedArgs = imageToolSchema.parse(args || {});

        // Check if format was corrected
        if (originalFormat && typeof originalFormat === "string") {
          const normalizedOriginal = originalFormat.toLowerCase();
          const validFormats = ["png", "jpg", "jpeg", "data"];
          if (!validFormats.includes(normalizedOriginal) && validatedArgs.format === "png") {
            // Format was corrected, add the original format to the validated args
            (validatedArgs as any)._originalFormat = originalFormat;
          }
        }

        response = await imageToolHandler(validatedArgs, toolContext);
        break;
      }
      case "analyze": {
        const validatedArgs = analyzeToolSchema.parse(args || {});
        response = await analyzeToolHandler(validatedArgs, toolContext);
        break;
      }
      case "list": {
        const validatedArgs = listToolSchema.parse(args || {});
        response = await listToolHandler(validatedArgs, toolContext);
        break;
      }
      default:
        response = {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
        logger.error(`Unknown tool: ${name}`);
    }

    return response;
  } catch (error) {
    logger.error({ error, toolName: name }, "Tool execution failed");

    // If it's a Zod validation error, return a more helpful message
    if (error && typeof error === "object" && "issues" in error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Invalid arguments: ${(error as z.ZodError).issues.map((issue) => issue.message).join(", ")}`,
          },
        ],
        isError: true,
      } as ToolResponse;
    }

    // For any other error, return a proper error response instead of throwing
    return {
      content: [
        {
          type: "text" as const,
          text: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    } as ToolResponse;
  }
});

async function main() {
  try {
    // Create transport and connect
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info("PeepIt MCP Server started successfully");
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  try {
    await server.close();
    logger.flush();
  } catch (e) {
    logger.error({ error: e }, "Error during server close on SIGTERM");
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  try {
    await server.close();
    logger.flush();
  } catch (e) {
    logger.error({ error: e }, "Error during server close on SIGINT");
  }
  process.exit(0);
});

main().catch((error) => {
  logger.error({ error }, "Fatal error in main");
  process.exit(1);
});
