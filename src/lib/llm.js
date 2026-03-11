/**
 * LLM Singleton
 *
 * Reads LLM_PROVIDER from .env and returns the matching adapter.
 * Controllers import this file — never a concrete adapter directly.
 */

const provider = process.env.LLM_PROVIDER || "mock";

let adapter;

if (provider === "claude") {
  const ClaudeAdapter = require("../adapters/llm/claude.adapter");
  adapter = new ClaudeAdapter();
} else if (provider === "mock") {
  const MockLLMAdapter = require("../adapters/llm/mock.adapter");
  adapter = new MockLLMAdapter();
} else {
  throw new Error(
    `Unknown or unsupported LLM_PROVIDER: "${provider}". Currently supported: "claude", "mock".`
  );
}

module.exports = adapter;