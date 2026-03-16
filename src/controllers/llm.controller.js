/**
 * LLM Controller (Mock-friendly)
 *
 * Expose une route simple pour tester le pipeline LLM
 * sans dépendre d'un provider externe.
 */
const llm = require("../lib/llm");
const prisma = require("../lib/prisma");
const { buildLimitedHistoryMessages } = require("../lib/llmHistory");
const { getGameMasterSystemPrompt } = require("../lib/gmSystemPrompt");

/**
 * POST /llm/test
 *
 * Réponse "classique" non-streamée (JSON complet).
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

  const systemPrompt = getGameMasterSystemPrompt();

  try {
    const {
      messages,
      summaryTriggered,
    } = await buildLimitedHistoryMessages(
      sessionId || null,
      userContent,
      systemPrompt
    );

    const { text, usage } = await llm.sendMessage(
      messages,
      systemPrompt,
      sessionId || null
    );

    // 3) Si une session est fournie, on persiste aussi la réponse du MJ
    //    comme message isGmMessage=true pour qu'elle apparaisse dans le chat
    //    et soit prise en compte dans l'historique suivant.
    if (sessionId && text && text.trim().length > 0) {
      try {
        await prisma.message.create({
          data: {
            gameSessionId: sessionId,
            authorUserId: null,
            isGmMessage: true,
            content: text,
            caption: null,
            selectedMood: null,
          },
        });
      } catch (persistError) {
        console.error(
          "[llm.controller] Erreur lors de la création du message MJ:",
          persistError
        );
      }
    }

    // 4) Logger l'usage des tokens si on a une session de jeu
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

/**
 * GET /llm/test/stream
 *
 * Variante "streaming" via Server-Sent Events (SSE).
 * Compatible avec tous les providers via un pseudo-streaming
 * (on découpe la réponse finale en petits morceaux envoyés
 * progressivement).
 *
 * Query:
 * - message?:   string
 * - sessionId?: string
 */
const testLLMStream = async (req, res) => {
  const { message, sessionId } = req.query || {};

  const userContent =
    typeof message === "string" && message.trim().length > 0
      ? message.trim()
      : "Le joueur se prépare pour une nouvelle scène de test (streaming).";

  const systemPrompt = getGameMasterSystemPrompt();

  // Headers SSE
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Permet d'envoyer un premier ping pour ouvrir le flux
  res.write("event: open\n");
  res.write("data: STREAM_STARTED\n\n");

  try {
    const {
      messages,
      summaryTriggered,
    } = await buildLimitedHistoryMessages(
      sessionId || null,
      userContent,
      systemPrompt
    );

    const { text, usage } = await llm.sendMessage(
      messages,
      systemPrompt,
      sessionId || null
    );

    // Logger l'usage des tokens comme dans testLLM
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
        console.error(
          "[llm.controller] Erreur lors de la création de TokenUsage (stream):",
          logError
        );
      }
    }

    const fullText = text || "";

    // Pseudo-streaming : on découpe en morceaux raisonnables
    const chunkSize = 200; // caractères par chunk
    let offset = 0;

    const interval = setInterval(() => {
      if (offset >= fullText.length) {
        clearInterval(interval);
        res.write("event: end\n");
        res.write("data: STREAM_COMPLETED\n\n");
        res.end();
        return;
      }

      const chunk = fullText.slice(offset, offset + chunkSize);
      offset += chunkSize;

      // On échappe simplement les retours à la ligne dans le payload
      const safeChunk = chunk.replace(/\r?\n/g, "\\n");
      res.write("event: chunk\n");
      res.write(`data: ${safeChunk}\n\n`);
    }, 120);
  } catch (error) {
    console.error("[llm.controller] testLLMStream error:", error);
    res.write("event: error\n");
    res.write('data: "Erreur lors de l\'appel LLM."\n\n');
    res.end();
  }
};

module.exports = { testLLM, testLLMStream };

