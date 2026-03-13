/**
 * LLM Controller (Mock-friendly)
 *
 * Expose une route simple pour tester le pipeline LLM
 * sans dépendre d'un provider externe.
 */
const llm = require("../lib/llm");
const prisma = require("../lib/prisma");
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
    // 1) Construire l'historique limité pour cette session (si fournie)
    const {
      messages,
      summaryTriggered,
    } = await buildLimitedHistoryMessages(
      sessionId || null,
      userContent,
      systemPrompt
    );

    // 2) Appeler l'adapter LLM (mock ou futur Claude)
    const { text, usage } = await llm.sendMessage(
      messages,
      systemPrompt,
      sessionId || null
    );

    // 3) Logger l'usage des tokens si on a une session de jeu
    if (sessionId && usage) {
      const inputTokens = usage.input_tokens ?? 0;
      const outputTokens = usage.output_tokens ?? 0;
      const cacheCreationTokens =
        usage.cache_creation_tokens ??
        usage.cache_creation_input_tokens ??
        0;
      const cacheReadTokens =
        usage.cache_read_tokens ?? usage.cache_read_input_tokens ?? 0;

      const totalBilledTokens =
        inputTokens + outputTokens + cacheCreationTokens + cacheReadTokens;

      try {
        await prisma.tokenUsage.create({
          data: {
            session_id: sessionId,
            author: "gm",
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cache_creation_tokens: cacheCreationTokens,
            cache_read_tokens: cacheReadTokens,
            total_billed_tokens: totalBilledTokens,
            summary_triggered: !!summaryTriggered,
          },
        });
      } catch (logError) {
        // On loggue mais on ne bloque pas la réponse au client
        console.error(
          "[llm.controller] Erreur lors de la création de TokenUsage:",
          logError
        );
      }
    }

    return res.status(200).json({
      success: true,
      provider: process.env.LLM_PROVIDER || "mock",
      reply: text,
      usage,
      summaryTriggered,
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

