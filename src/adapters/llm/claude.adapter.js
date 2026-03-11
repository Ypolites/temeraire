/**
 * Claude Adapter
 *
 * Implements LLMInterface using Anthropic's Claude API.
 * Swap this file (or add a new one) to change LLM provider.
 */

const Anthropic = require("@anthropic-ai/sdk");
const LLMInterface = require("./llm.interface");

class ClaudeAdapter extends LLMInterface {
  constructor() {
    super();
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.LLM_MODEL || "claude-opus-4-5";
  }

  /**
   * Send a conversation to Claude and get a response.
   *
   * @param {Array<{role: "user"|"assistant", content: string}>} messages
   * @param {string} systemPrompt
   * @returns {Promise<string>}
   */
  async sendMessage(messages, systemPrompt) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    return response.content[0].text;
  }
}

module.exports = ClaudeAdapter;