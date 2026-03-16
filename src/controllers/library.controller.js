const prisma = require("../lib/prisma");

/**
 * POST /sessions/:id/documents
 * Creates a markdown-based library entry for the session.
 */
const uploadDocument = async (req, res) => {
  const { id: gameSessionId } = req.params;
  const { title, category, content } = req.body;

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

    // For the simplified v1, we store markdown content instead of a physical file.
    const document = await prisma.libraryDocument.create({
      data: {
        gameSessionId,
        createdByUserId: req.user.userId,
        title,
        category,
        content: content || "",
        // Legacy file metadata kept for backward compatibility, but not used for new entries.
        fileType: "MD",
        fileUrl: "",
      },
    });

    return res.status(201).json({ success: true, document });
  } catch (error) {
    console.error("[library.controller] uploadDocument error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * GET /sessions/:id/documents
 * Returns all documents for a session.
 */
const getDocuments = async (req, res) => {
  const { id: gameSessionId } = req.params;

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

    const documents = await prisma.libraryDocument.findMany({
      where: { gameSessionId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, documents });
  } catch (error) {
    console.error("[library.controller] getDocuments error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * DELETE /sessions/:id/documents/:docId
 * Deletes a document record.
 */
const deleteDocument = async (req, res) => {
  const { id: gameSessionId, docId } = req.params;

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

    const document = await prisma.libraryDocument.findUnique({
      where: { id: docId },
    });

    if (!document || document.gameSessionId !== gameSessionId) {
      return res.status(404).json({
        success: false,
        errors: ["Document introuvable."],
      });
    }

    await prisma.libraryDocument.delete({ where: { id: docId } });

    return res.status(200).json({
      success: true,
      message: "Document supprimé.",
    });
  } catch (error) {
    console.error("[library.controller] deleteDocument error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

module.exports = { uploadDocument, getDocuments, deleteDocument };