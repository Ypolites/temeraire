/**
 * Mock LLM Adapter
 *
 * Implémente LLMInterface mais ne fait aucun appel externe.
 * Permet de développer et tester l'app sans abonnement LLM.
 */

const LLMInterface = require("./llm.interface");

class MockLLMAdapter extends LLMInterface {
  constructor() {
    super();
  }

  /**
   * Simule une réponse de MJ à partir du dernier message joueur.
   *
   * @param {Array<{role: "user"|"assistant", content: string}>} messages
   * @param {string} systemPrompt
   * @param {string|null} sessionId
   * @returns {Promise<{ text: string, usage: any, summaryTriggered: boolean }>}
   */
  async sendMessage(messages, systemPrompt, sessionId = null) {
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content ??
      "Aucun message joueur.";

    const preview =
      lastUserMessage.length > 240
        ? lastUserMessage.slice(0, 240) + "…"
        : lastUserMessage;

    const text = [
      "⟡ [MOCK LLM] — Réponse simulée du Maître de Jeu.",
      "",
      "Je n'appelle pas de véritable API LLM.",
      "Tu peux néanmoins brancher tout le piping back/front,",
      "tester les sessions, les messages et les jets de dés.",
      "",
      "Dernier message joueur reçu :",
      `« ${preview} »`,
    ].join("\n");

    // Valeurs factices mais cohérentes avec ce qu'attend le contrôleur
    const usage = {
      input_tokens: 0,
      output_tokens: 0,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    };

    return {
      text,
      usage,
      summaryTriggered: false,
    };
  }
}

module.exports = MockLLMAdapter;

