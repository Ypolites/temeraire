/**
 * Claude Adapter
 *
 * Implémente LLMInterface pour Anthropic Claude.
 */

const Anthropic = require("@anthropic-ai/sdk");
const LLMInterface = require("./llm.interface");

class ClaudeAdapter extends LLMInterface {
  constructor() {
    super();
    this.model = process.env.LLM_MODEL || "claude-sonnet-4-5";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        '[ClaudeAdapter] ANTHROPIC_API_KEY manquant. Ajoute ta clé dans le fichier .env.'
      );
    }

    this.client = new Anthropic({
      apiKey,
    });
  }

  /**
   * Send a conversation to Claude and get a response.
   *
   * @param {Array<{role: "user"|"assistant", content: string}>} messages
   * @param {string} systemPrompt
   * @param {string|null} sessionId
   * @returns {Promise<{ text: string, usage: any, summaryTriggered: boolean }>}
   */
  async sendMessage(messages, systemPrompt, sessionId = null) {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error(
        "[ClaudeAdapter] messages doit être un tableau non vide pour sendMessage."
      );
    }

    const maxOutputTokens = parseInt(
      process.env.LLM_MAX_OUTPUT_TOKENS || "1024",
      10
    );

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: maxOutputTokens,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content?.[0]?.text ?? "";
    const usage = response.usage || {};

    return {
      text,
      usage,
      // Le résumé éventuel est géré côté llmHistory, pas ici
      summaryTriggered: false,
      sessionId,
    };
  }
}

module.exports = ClaudeAdapter;
