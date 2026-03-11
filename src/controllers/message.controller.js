/**
 * Message Controller
 *
 * Handles sending and listing messages within a game session.
 * All routes are protected — req.user is set by auth.middleware.
 */
const prisma = require("../lib/prisma");

const PAGE_SIZE = 50;

/**
 * POST /sessions/:id/messages
 * Sends a message in a game session.
 */
const createMessage = async (req, res) => {
  const { id: gameSessionId } = req.params;
  const { content, caption, selectedMood } = req.body;

  try {
    const session = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        errors: ["Session introuvable."],
      });
    }

    if (session.ownerUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        errors: ["Accès refusé."],
      });
    }

    const message = await prisma.message.create({
      data: {
        gameSessionId,
        authorUserId:  req.user.userId,
        isGmMessage:   false,
        content,
        caption:       caption      ?? null,
        selectedMood:  selectedMood ?? null,
      },
    });

    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("[message.controller] createMessage error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * GET /sessions/:id/messages
 * Returns paginated messages for a game session.
 * Query param: ?page=1 (default: 1)
 */
const getMessages = async (req, res) => {
  const { id: gameSessionId } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  try {
    const session = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        errors: ["Session introuvable."],
      });
    }

    if (session.ownerUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        errors: ["Accès refusé."],
      });
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { gameSessionId },
        orderBy: { createdAt: "asc" },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.message.count({
        where: { gameSessionId },
      }),
    ]);

    return res.status(200).json({
      success: true,
      messages,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (error) {
    console.error("[message.controller] getMessages error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

module.exports = { createMessage, getMessages };