/**
 * Claude Adapter
 *
 * Implements LLMInterface using Anthropic's Claude API.
 * Includes two token-saving strategies:
 *   1. Sliding window  — only the last N messages are sent
 *   2. Prompt caching  — system prompt is cached for 5 minutes (up to -90% cost)
 */

const Anthropic = require("@anthropic-ai/sdk");
const LLMInterface = require("./llm.interface");

// ─── Configuration ────────────────────────────────────────────────────────────
// How many recent messages to keep in context.
// Older messages are dropped to limit input tokens.
// Adjust this value based on your session length needs.
const MAX_HISTORY_MESSAGES = 20;

class ClaudeAdapter extends LLMInterface {
  constructor() {
    super();
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.LLM_MODEL || "claude-sonnet-4-5";
  }

  /**
   * Send a conversation to Claude and get a response.
   *
   * @param {Array<{role: "user"|"assistant", content: string}>} messages
   *   Full conversation history. Will be trimmed to MAX_HISTORY_MESSAGES.
   *
   * @param {string} systemPrompt
   *   The Game Master instructions. Will be cached by Anthropic for 5 minutes.
   *
   * @returns {Promise<{ text: string, usage: object }>}
   */
  async sendMessage(messages, systemPrompt) {

    // ── Strategy 1 : Sliding window ──────────────────────────────────────────
    // We keep only the last N messages. If the session has 100 messages and
    // MAX_HISTORY_MESSAGES = 20, we discard the first 80.
    // slice(-N) returns the last N elements of an array.
    const trimmedMessages = messages.slice(-MAX_HISTORY_MESSAGES);

    // Log when we actually trim, so you know it's working
    if (messages.length > MAX_HISTORY_MESSAGES) {
      console.log(
        `[ClaudeAdapter] History trimmed: ${messages.length} → ${trimmedMessages.length} messages`
      );
    }

    // ── Strategy 2 : Prompt caching ──────────────────────────────────────────
    // Instead of passing system as a plain string, we pass it as an array.
    // The cache_control marker tells Anthropic to cache this block for 5 min.
    // On cache hit, input tokens for this block cost ~10% of the normal price.
    // Anthropic docs: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
    const systemBlock = [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ];

    // ── API call ──────────────────────────────────────────────────────────────
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: systemBlock,
      messages: trimmedMessages,
    });

    // ── Token monitoring ─────────────────────────────────────────────────────
    // Anthropic returns token counts in every response.
    // We log them so you can track consumption per call.
    // cache_read_input_tokens = tokens served from cache (cheap)
    // cache_creation_input_tokens = tokens written to cache (first call)
    const usage = response.usage;
    console.log("[ClaudeAdapter] Token usage:", {
      input: usage.input_tokens,
      output: usage.output_tokens,
      cache_created: usage.cache_creation_input_tokens ?? 0,
      cache_read: usage.cache_read_input_tokens ?? 0,
      total_billed: usage.input_tokens + usage.output_tokens,
    });

    // ── Return ────────────────────────────────────────────────────────────────
    // We return both the text and the usage object.
    // The caller can choose to ignore usage if it doesn't need it.
    return {
      text: response.content[0].text,
      usage,
    };
  }
}

module.exports = ClaudeAdapter;
