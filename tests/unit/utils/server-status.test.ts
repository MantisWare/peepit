import { generateServerStatusString } from "../../../src/utils/server-status";

describe("Server Status Utility - generateServerStatusString", () => {
  const testVersion = "1.2.3";

  beforeEach(() => {
    // Clear the environment variable before each test
    delete process.env.PEEPIT_AI_PROVIDERS;
  });

  it("should return status with default providers text when PEEPIT_AI_PROVIDERS is not set", () => {
    const status = generateServerStatusString(testVersion);
    expect(status).toBe(`PeepIt MCP ${testVersion} using None Configured. Set PEEPIT_AI_PROVIDERS ENV.`);
  });

  it("should return status with default providers text when PEEPIT_AI_PROVIDERS is an empty string", () => {
    process.env.PEEPIT_AI_PROVIDERS = "";
    const status = generateServerStatusString(testVersion);
    expect(status).toBe(`PeepIt MCP ${testVersion} using None Configured. Set PEEPIT_AI_PROVIDERS ENV.`);
  });

  it("should return status with default providers text when PEEPIT_AI_PROVIDERS is whitespace", () => {
    process.env.PEEPIT_AI_PROVIDERS = "   ";
    const status = generateServerStatusString(testVersion);
    expect(status).toBe(`PeepIt MCP ${testVersion} using None Configured. Set PEEPIT_AI_PROVIDERS ENV.`);
  });

  it("should list a single provider from PEEPIT_AI_PROVIDERS", () => {
    process.env.PEEPIT_AI_PROVIDERS = "ollama/llava";
    const status = generateServerStatusString(testVersion);
    expect(status).toBe(`PeepIt MCP ${testVersion} using ollama/llava`);
  });

  it("should list multiple providers from PEEPIT_AI_PROVIDERS, trimmed and joined", () => {
    process.env.PEEPIT_AI_PROVIDERS = "ollama/llava, openai/gpt-4o";
    const status = generateServerStatusString(testVersion);
    expect(status).toBe(`PeepIt MCP ${testVersion} using ollama/llava, openai/gpt-4o`);
  });

  it("should handle extra whitespace and empty segments in PEEPIT_AI_PROVIDERS", () => {
    process.env.PEEPIT_AI_PROVIDERS =
      "  ollama/llava  , ,, openai/gpt-4o  ,anthropic/claude ";
    const status = generateServerStatusString(testVersion);
    expect(status).toBe(`PeepIt MCP ${testVersion} using ollama/llava, openai/gpt-4o, anthropic/claude`);
  });

  it("should correctly include the provided version string", () => {
    const customVersion = "z.y.x";
    const status = generateServerStatusString(customVersion);
    expect(status).toBe(`PeepIt MCP ${customVersion} using None Configured. Set PEEPIT_AI_PROVIDERS ENV.`);
  });

  it("should produce a trimmed string", () => {
    const status = generateServerStatusString("0.0.1");
    expect(status).not.toMatch(/^\s/); // No leading whitespace
    expect(status).not.toMatch(/\s$/); // No trailing whitespace
    expect(status.startsWith("PeepIt MCP")).toBe(true);
  });
});