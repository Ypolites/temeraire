/**
 * LLM History Utilities
 *
 * Construit l'historique de conversation pour une GameSession
 * et le tronque en fonction d'un budget approximatif de tokens.
 *
 * L'objectif est d'éviter d'envoyer trop de contexte à l'API LLM
 * tout en conservant les messages les plus récents.
 */

const prisma = require("./prisma");
const Anthropic = require("@anthropic-ai/sdk");

// Approximation grossière : ~4 caractères par token
// (suffisant pour une stratégie de trimming conservatrice)
const APPROX_CHARS_PER_TOKEN = 4;

// Budget maximum de tokens pour l'entrée (prompt + messages)
// Peut être configuré via l'env, sinon valeur par défaut raisonnable.
const DEFAULT_MAX_INPUT_TOKENS = parseInt(
  process.env.LLM_MAX_INPUT_TOKENS || "4000",
  10
);

// Seuil à partir duquel on tente de résumer l'historique
const SUMMARY_TRIGGER_TOKENS = parseInt(
  process.env.LLM_SUMMARY_TRIGGER_TOKENS || "8000",
  10
);

// Nombre de messages récents à conserver intacts
const SUMMARY_RECENT_MESSAGE_COUNT = parseInt(
  process.env.LLM_SUMMARY_RECENT_MESSAGE_COUNT || "20",
  10
);

const LLM_PROVIDER = process.env.LLM_PROVIDER || "mock";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function estimateTokensForText(text) {
  if (!text || typeof text !== "string") return 0;
  return Math.ceil(text.length / APPROX_CHARS_PER_TOKEN);
}

function estimateTokensForMessages(messages, systemPrompt) {
  let total = estimateTokensForText(systemPrompt);
  for (const msg of messages) {
    total += estimateTokensForText(msg.content);
  }
  return total;
}

async function maybeCreateSummary(
  gameSessionId,
  systemPrompt,
  dbMessages
) {
  // On ne tente un résumé que si on a un provider Claude configuré.
  if (LLM_PROVIDER !== "claude" || !ANTHROPIC_API_KEY) {
    return false;
  }

  if (dbMessages.length === 0) {
    return false;
  }

  // Garder intacts les N derniers messages,
  // résumer tout ce qui est avant.
  const cutoffIndex = Math.max(0, dbMessages.length - SUMMARY_RECENT_MESSAGE_COUNT);
  const toSummarize = dbMessages.slice(0, cutoffIndex);

  if (toSummarize.length === 0) {
    return false;
  }

  // Construire les messages à résumer
  const anthropicMessages = toSummarize.map((m) => ({
    role: m.isGmMessage ? "assistant" : "user",
    content: m.content,
  }));

  const client = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });

  const summarySystemPrompt =
    "Tu es un assistant qui résume les événements d'une partie de jeu de rôle Temeraire. " +
    "Produis un résumé concis mais complet en français, en gardant les éléments importants " +
    "pour continuer la narration (PNJ clés, objectifs, enjeux dramatiques, informations découvertes).";

  const response = await client.messages.create({
    model: process.env.LLM_MODEL || "claude-opus-4-5",
    max_tokens: 512,
    system: summarySystemPrompt,
    messages: anthropicMessages,
  });

  const summaryText = response.content?.[0]?.text ?? null;

  if (!summaryText) {
    return false;
  }

  await prisma.message.create({
    data: {
      gameSessionId,
      isGmMessage: true,
      authorUserId: null,
      content: summaryText,
      caption: "[SUMMARY]",
      selectedMood: null,
    },
  });

  return true;
}

/**
 * Construit les messages pour l'appel LLM à partir :
 * - de l'historique BDD d'une GameSession
 * - du dernier message joueur (non encore persisté)
 * Puis tronque depuis le début tant que le budget de tokens est dépassé.
 *
 * @param {string} gameSessionId
 * @param {string} latestUserContent
 * @param {string} systemPrompt
 * @param {number} [maxInputTokens]
 * @returns {Promise<{ messages: Array<{role: "user"|"assistant", content: string}>, summaryTriggered: boolean }>}
 */
async function buildLimitedHistoryMessages(
  gameSessionId,
  latestUserContent,
  systemPrompt,
  maxInputTokens = DEFAULT_MAX_INPUT_TOKENS
) {
  if (!gameSessionId) {
    return {
      messages: [
        {
          role: "user",
          content: latestUserContent,
        },
      ],
      summaryTriggered: false,
    };
  }

  const dbMessages = await prisma.message.findMany({
    where: { gameSessionId },
    orderBy: { createdAt: "asc" },
  });

  let summaryTriggered = false;

  // On reconstruit d'abord les messages existants (y compris résumés éventuels)
  let existingMessages = dbMessages.map((m) => ({
    role: m.isGmMessage ? "assistant" : "user",
    content: m.content,
    caption: m.caption || null,
  }));

  // Si un résumé existe déjà (caption === "[SUMMARY]"), on ignore
  // tous les messages antérieurs au dernier résumé, pour éviter
  // de ressaisir l'historique brut complet.
  const lastSummaryIndex = existingMessages
    .map((m, idx) => (m.caption === "[SUMMARY]" ? idx : -1))
    .filter((idx) => idx >= 0)
    .pop();

  if (lastSummaryIndex !== undefined && lastSummaryIndex >= 0) {
    existingMessages = existingMessages.slice(lastSummaryIndex);
  }

  const fullMessages = [
    ...existingMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    {
      role: "user",
      content: latestUserContent,
    },
  ];

  const estimatedBeforeSummary = estimateTokensForMessages(
    fullMessages,
    systemPrompt
  );

  // Si l'historique complet dépasse largement le seuil de résumé,
  // on tente de générer un résumé de la partie la plus ancienne.
  if (estimatedBeforeSummary > SUMMARY_TRIGGER_TOKENS) {
    try {
      const didSummarize = await maybeCreateSummary(
        gameSessionId,
        systemPrompt,
        dbMessages
      );
      summaryTriggered = didSummarize;

      if (didSummarize) {
        // Recharger les messages après création du résumé,
        // pour qu'il soit inclus dans l'historique envoyé au LLM.
        const refreshed = await prisma.message.findMany({
          where: { gameSessionId },
          orderBy: { createdAt: "asc" },
        });

        let refreshedMessages = refreshed.map((m) => ({
          role: m.isGmMessage ? "assistant" : "user",
          content: m.content,
          caption: m.caption || null,
        }));

        const lastSummaryIndexRefreshed = refreshedMessages
          .map((m, idx) => (m.caption === "[SUMMARY]" ? idx : -1))
          .filter((idx) => idx >= 0)
          .pop();

        if (
          lastSummaryIndexRefreshed !== undefined &&
          lastSummaryIndexRefreshed >= 0
        ) {
          refreshedMessages = refreshedMessages.slice(lastSummaryIndexRefreshed);
        }

        existingMessages = refreshedMessages;
      }
    } catch (e) {
      console.error(
        "[llmHistory] Erreur lors de la tentative de résumé automatique:",
        e
      );
    }
  }

  const messagesWithLatest = [
    ...existingMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    {
      role: "user",
      content: latestUserContent,
    },
  ];

  // Si tout rentre déjà dans le budget, renvoyer directement
  if (
    estimateTokensForMessages(messagesWithLatest, systemPrompt) <= maxInputTokens
  ) {
    return { messages: messagesWithLatest, summaryTriggered };
  }

  // Sinon, on supprime progressivement les messages les plus anciens
  // jusqu'à repasser sous le budget.
  let startIndex = 0;
  while (startIndex < messagesWithLatest.length - 1) {
    const sliced = messagesWithLatest.slice(startIndex);
    const estimated = estimateTokensForMessages(sliced, systemPrompt);
    if (estimated <= maxInputTokens) {
      return { messages: sliced, summaryTriggered };
    }
    startIndex += 1;
  }

  // Fallback ultra défensif : ne garder que le dernier message joueur
  return {
    messages: [
      {
        role: "user",
        content: latestUserContent,
      },
    ],
    summaryTriggered,
  };
}

module.exports = {
  buildLimitedHistoryMessages,
};

