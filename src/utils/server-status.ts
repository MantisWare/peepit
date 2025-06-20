export function generateServerStatusString(version: string): string {
  const aiProviders = process.env.PEEPIT_AI_PROVIDERS;

  let providersText = "None Configured. Set PEEPIT_AI_PROVIDERS ENV.";
  if (aiProviders && aiProviders.trim()) {
    const providers = aiProviders
      .split(/[,;]/) // Support both comma and semicolon separators
      .map((p) => p.trim())
      .filter(Boolean);
    providersText = providers.join(", ");
  }

  return `\n\nPeepIt MCP ${version} using ${providersText}`.trim();
}
