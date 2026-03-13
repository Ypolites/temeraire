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
    let messages;
    let summaryTriggered = false;

    // Si une session est fournie, on reconstruit l'historique
    // et on le tronque en fonction d'un budget approximatif de tokens.
    if (sessionId) {
      const historyResult = await buildLimitedHistoryMessages(
        sessionId,
        userContent,
        systemPrompt
      );
      messages = historyResult.messages;
      summaryTriggered = historyResult.summaryTriggered;
    } else {
      messages = [
        {
          role: "user",
          content: userContent,
        },
      ];
    }

    // sessionId est optionnel — s'il est absent, le log BDD est ignoré
    // et seul le log console est produit (comportement défini dans claude.adapter.js)
    const { text, usage } = await llm.sendMessage(
      messages,
      systemPrompt,
      sessionId || null
    );

    return res.status(200).json({
      success: true,
      provider: process.env.LLM_PROVIDER || "mock",
      reply: text,
      usage: {
        input_tokens:   usage.input_tokens,
        output_tokens:  usage.output_tokens,
        cache_created:  usage.cache_creation_input_tokens ?? 0,
        cache_read:     usage.cache_read_input_tokens ?? 0,
      },
      summary_triggered: summaryTriggered,
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