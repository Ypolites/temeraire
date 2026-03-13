/**
 * Claude Adapter
 *
 * Implements LLMInterface using Anthropic's Claude API.
 * Swap this file (or add a new one) to change LLM provider.
 */

const Anthropic = require("@anthropic-ai/sdk");
const LLMInterface = require("./llm.interface");
const prisma = require("../../lib/prisma");

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
   * @param {string|null} sessionId
   * @returns {Promise<{ text: string, usage: any, summaryTriggered: boolean }>}
   */
  async sendMessage(messages, systemPrompt, sessionId = null) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    const text = response.content?.[0]?.text ?? "";

    const usage = {
      input_tokens: response.usage?.input_tokens ?? 0,
      output_tokens: response.usage?.output_tokens ?? 0,
      cache_creation_input_tokens:
        response.usage?.cache_creation_input_tokens ?? 0,
      cache_read_input_tokens: response.usage?.cache_read_input_tokens ?? 0,
    };

    // Stratégie actuelle : total facturé ≈ input + output,
    // en attendant d'exploiter un champ dédié de l'API si disponible.
    const totalBilledTokens =
      (response.usage?.input_tokens ?? 0) +
      (response.usage?.output_tokens ?? 0);

    // À ce stade, le résumé automatique est géré en amont,
    // dans la construction de l'historique (llmHistory),
    // et signalé via TokenUsage.summary_triggered.
    const summaryTriggered = false;

    // Si une session est fournie, on logge l'usage en base.
    if (sessionId) {
      try {
        await prisma.tokenUsage.create({
          data: {
            session_id: sessionId,
            author: "gm",
            input_tokens: usage.input_tokens,
            output_tokens: usage.output_tokens,
            cache_creation_tokens: usage.cache_creation_input_tokens,
            cache_read_tokens: usage.cache_read_input_tokens,
            total_billed_tokens: totalBilledTokens,
            summary_triggered: summaryTriggered,
          },
        });
      } catch (logError) {
        console.error(
          "[ClaudeAdapter] Erreur lors de la sauvegarde de TokenUsage:",
          logError
        );
      }
    }

    return {
      text,
      usage,
      summaryTriggered,
    };
  }
}

module.exports = ClaudeAdapter;