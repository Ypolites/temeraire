/**
 * Library Document Controller
 *
 * Handles upload, listing and deletion of library documents.
 * Accepts PDF and common text/document formats.
 */
const path = require("path");
const fs = require("fs");
const prisma = require("../lib/prisma");

const DOCS_DIR = path.join(__dirname, "../../public/uploads/documents");

/**
 * POST /sessions/:id/documents
 * Uploads a document to the session library.
 */
const uploadDocument = async (req, res) => {
  const { id: gameSessionId } = req.params;
  const { title, category } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      errors: ["Aucun fichier reçu."],
    });
  }

  try {
    const session = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
    });

    if (!session) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        errors: ["Session introuvable."],
      });
    }

    if (session.ownerUserId !== req.user.userId) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        errors: ["Accès refusé."],
      });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    const fileType = path.extname(req.file.originalname).replace(".", "").toUpperCase();

    const document = await prisma.libraryDocument.create({
      data: {
        gameSessionId,
        createdByUserId: req.user.userId,
        title,
        category,
        fileType,
        fileUrl,
      },
    });

    return res.status(201).json({ success: true, document });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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
 * Deletes a document (file + database record).
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

    // Delete file from disk
    if (document.fileUrl) {
      const filePath = path.join(__dirname, "../../public", document.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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