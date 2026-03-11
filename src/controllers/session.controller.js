/**
 * Game Session Controller
 *
 * Handles CRUD operations for game sessions.
 * All routes are protected — req.user is set by auth.middleware.
 */
const prisma = require("../lib/prisma");

/**
 * POST /sessions
 * Creates a new game session owned by the authenticated user.
 */
const createSession = async (req, res) => {
  const { name } = req.body;

  try {
    const session = await prisma.gameSession.create({
      data: {
        ownerUserId: req.user.userId,
        name,
      },
    });

    return res.status(201).json({ success: true, session });
  } catch (error) {
    console.error("[session.controller] createSession error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * GET /sessions
 * Returns all sessions owned by the authenticated user.
 */
const getSessions = async (req, res) => {
  try {
    const sessions = await prisma.gameSession.findMany({
      where: { ownerUserId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, sessions });
  } catch (error) {
    console.error("[session.controller] getSessions error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * GET /sessions/:id
 * Returns a single session by ID.
 * Only accessible by the session owner.
 */
const getSessionById = async (req, res) => {
  const { id } = req.params;

  try {
    const session = await prisma.gameSession.findUnique({
      where: { id },
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

    return res.status(200).json({ success: true, session });
  } catch (error) {
    console.error("[session.controller] getSessionById error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * DELETE /sessions/:id
 * Deletes a session.
 * Only accessible by the session owner.
 */
const deleteSession = async (req, res) => {
  const { id } = req.params;

  try {
    const session = await prisma.gameSession.findUnique({
      where: { id },
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

    await prisma.gameSession.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Session supprimée.",
    });
  } catch (error) {
    console.error("[session.controller] deleteSession error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

module.exports = { createSession, getSessions, getSessionById, deleteSession };