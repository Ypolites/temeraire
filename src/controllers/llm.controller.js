/**
 * LLM Controller (Mock-friendly)
 *
 * Expose une route simple pour tester le pipeline LLM
 * sans dépendre d'un provider externe.
 */
const llm = require("../lib/llm");

/**
 * POST /llm/test
 *
 * Body:
 * - message?: string
 */
const testLLM = async (req, res) => {
  const { message } = req.body || {};

  const userContent =
    typeof message === "string" && message.trim().length > 0
      ? message.trim()
      : "Le joueur se prépare pour une nouvelle scène de test.";

  const messages = [
    {
      role: "user",
      content: userContent,
    },
  ];

  const systemPrompt =
    "Tu es un Maître de Jeu pour Temeraire: Le JDR. " +
    "Réponds de manière immersive mais concise, en français. " +
    "Cette route est uniquement utilisée pour tester l'intégration.";

  try {
    // ── Changement ici ────────────────────────────────────────────────────
    // sendMessage retourne maintenant { text, usage } et non plus une string.
    // On destructure pour récupérer les deux valeurs séparément.
    const { text, usage } = await llm.sendMessage(messages, systemPrompt);

    return res.status(200).json({
      success: true,
      provider: process.env.LLM_PROVIDER || "mock",
      reply: text,
      // On expose usage dans la réponse API — utile pendant le développement
      // pour vérifier la consommation sans aller chercher dans les logs.
      // Tu pourras le retirer (ou le masquer) en production.
      usage: {
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        cache_created: usage.cache_creation_input_tokens ?? 0,
        cache_read: usage.cache_read_input_tokens ?? 0,
      },
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
