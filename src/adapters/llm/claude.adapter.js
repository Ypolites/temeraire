/**
 * Claude Adapter
 *
 * Implémente LLMInterface pour Anthropic Claude.
 *
 * ⚠️ Important :
 * - Aucune requête réelle n'est effectuée tant que l'API Claude n'est pas
 *   configurée. Cet adapter existe principalement pour préparer l'intégration
 *   future (prompt caching, usage détaillé, etc.).
 */

// TODO: brancher réellement le SDK Anthropic et le prompt caching
// const Anthropic = require("@anthropic-ai/sdk");
const LLMInterface = require("./llm.interface");

class ClaudeAdapter extends LLMInterface {
  constructor() {
    super();
    this.model = process.env.LLM_MODEL || "claude-sonnet-4-5";
  }

  /**
   * Send a conversation to Claude and get a response.
   *
   * Pour le moment, l'intégration réelle avec l'API Anthropic n'est pas
   * activée : on lève une erreur explicite afin d'éviter toute confusion.
   * L'application est pensée pour tourner avec LLM_PROVIDER="mock" tant que
   * l'abonnement Claude n'est pas souscrit.
   *
   * @param {Array<{role: "user"|"assistant", content: string}>} messages
   * @param {string} systemPrompt
   * @param {string|null} sessionId
   * @returns {Promise<{ text: string, usage: any, summaryTriggered: boolean }>}
   */
  async sendMessage(messages, systemPrompt, sessionId = null) {
    throw new Error(
      '[ClaudeAdapter] LLM_PROVIDER="claude" sélectionné mais ' +
        "l'intégration API Anthropic n'est pas encore implémentée. " +
        'Utilise LLM_PROVIDER="mock" tant que Claude n’est pas configuré.'
    );
  }
}

module.exports = ClaudeAdapter;
