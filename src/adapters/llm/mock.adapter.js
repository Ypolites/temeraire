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
   * @returns {Promise<string>}
   */
  async sendMessage(messages, systemPrompt) {
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content ??
      "Aucun message joueur.";

    const preview =
      lastUserMessage.length > 240
        ? lastUserMessage.slice(0, 240) + "…"
        : lastUserMessage;

    return [
      "⟡ [MOCK LLM] — Réponse simulée du Maître de Jeu.",
      "",
      "Je n'appelle pas de véritable API LLM.",
      "Tu peux néanmoins brancher tout le piping back/front,",
      "tester les sessions, les messages et les jets de dés.",
      "",
      "Dernier message joueur reçu :",
      `« ${preview} »`,
    ].join("\n");
  }
}

module.exports = MockLLMAdapter;

