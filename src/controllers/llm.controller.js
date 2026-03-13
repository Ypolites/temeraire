/**
 * LLM Controller (Mock-friendly)
 *
 * Expose une route simple pour tester le pipeline LLM
 * sans dépendre d'un provider externe.
 */
const llm = require("../lib/llm");
const { buildLimitedHistoryMessages } = require("../lib/llmHistory");

/**
 * POST /llm/test
 *
 * Body:
 * - message?:   string
 * - sessionId?: string  — UUID d'une GameSession (optionnel, pour tester le log)
 */
const testLLM = async (req, res) => {
  const { message, sessionId } = req.body || {};

  const userContent =
    typeof message === "string" && message.trim().length > 0
      ? message.trim()
      : "Le joueur se prépare pour une nouvelle scène de test.";

  const systemPrompt =
    "Tu es un Maître de Jeu pour Temeraire: Le JDR. " +
    "Réponds de manière immersive mais concise, en français. " +
    "Cette route est uniquement utilisée pour tester l'intégration.";

  try {
    const reply = await llm.sendMessage(messages, systemPrompt);
    return res.status(200).json({
      success: true,
      provider: process.env.LLM_PROVIDER || "mock",
      reply,
    });
  } catch (error) {
    console.error("[llm.controller] testLLM error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur lors de l'appel LLM."],
    });
  }
};

module.exports = { testLLM };

