/**
 * Avatar Mood Controller
 *
 * Handles upload, listing and deletion of character mood images.
 * Images are compressed via Sharp before being saved.
 */
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const prisma = require("../lib/prisma");

const MAX_MOODS = 20;
const MOODS_DIR = path.join(__dirname, "../../public/uploads/moods");

/**
 * POST /characters/:id/moods
 * Uploads and compresses a mood image for a character.
 */
const uploadMood = async (req, res) => {
  const { id: characterId } = req.params;
  const { moodLabel } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      errors: ["Aucun fichier reçu."],
    });
  }

  try {
    // Verify character exists and belongs to the user
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        errors: ["Personnage introuvable."],
      });
    }

    if (character.userId !== req.user.userId) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        errors: ["Accès refusé."],
      });
    }

    // Check 20 photos limit
    const moodCount = await prisma.avatarMood.count({
      where: { characterId },
    });

    if (moodCount >= MAX_MOODS) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        errors: [`Limite de ${MAX_MOODS} photos atteinte pour ce personnage.`],
      });
    }

    // Compress image with Sharp
    const compressedFilename = `compressed-${req.file.filename}`;
    const compressedPath = path.join(MOODS_DIR, compressedFilename);

    await sharp(req.file.path)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(compressedPath);

    // Delete original uncompressed file
    fs.unlinkSync(req.file.path);

    const imageUrl = `/uploads/moods/${compressedFilename}`;

    const mood = await prisma.avatarMood.create({
      data: {
        characterId,
        moodLabel: moodLabel ?? null,
        imageUrl,
      },
    });

    return res.status(201).json({ success: true, mood });
  } catch (error) {
    // Clean up file if something went wrong
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("[mood.controller] uploadMood error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * GET /characters/:id/moods
 * Returns all mood images for a character.
 */
const getMoods = async (req, res) => {
  const { id: characterId } = req.params;

  try {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        errors: ["Personnage introuvable."],
      });
    }

    if (character.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        errors: ["Accès refusé."],
      });
    }

    const moods = await prisma.avatarMood.findMany({
      where: { characterId },
    });

    return res.status(200).json({ success: true, moods });
  } catch (error) {
    console.error("[mood.controller] getMoods error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * DELETE /characters/:id/moods/:moodId
 * Deletes a mood image (file + database record).
 */
const deleteMood = async (req, res) => {
  const { id: characterId, moodId } = req.params;

  try {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        errors: ["Personnage introuvable."],
      });
    }

    if (character.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        errors: ["Accès refusé."],
      });
    }

    const mood = await prisma.avatarMood.findUnique({
      where: { id: moodId },
    });

    if (!mood || mood.characterId !== characterId) {
      return res.status(404).json({
        success: false,
        errors: ["Photo introuvable."],
      });
    }

    // Delete file from disk
    if (mood.imageUrl) {
      const filePath = path.join(__dirname, "../../public", mood.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.avatarMood.delete({ where: { id: moodId } });

    return res.status(200).json({
      success: true,
      message: "Photo supprimée.",
    });
  } catch (error) {
    console.error("[mood.controller] deleteMood error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

module.exports = { uploadMood, getMoods, deleteMood };