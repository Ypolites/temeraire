/**
 * Character Controller
 *
 * Handles CRUD operations for characters.
 * All routes are protected — req.user is set by auth.middleware.
 */
const prisma = require("../lib/prisma");

/**
 * POST /characters
 * Creates a new character for the authenticated user.
 */
const createCharacter = async (req, res) => {
  const {
    gameSessionId, species, name, pronouns, position,
    appearance, nationality, serviceRecord, station,
    temperament, distinctions, attrBody, attrCunning,
    attrManners, attrSteel, burdenDuty, burdenDesire,
    connections, bonds, traits, abilities, equipment,
  } = req.body;

  try {
    const character = await prisma.character.create({
      data: {
        userId:        req.user.userId,
        gameSessionId,
        species,
        name,
        pronouns,
        position,
        appearance:    appearance    ?? null,
        nationality:   nationality   ?? null,
        serviceRecord: serviceRecord ?? null,
        station:       station       ?? null,
        temperament:   temperament   ?? null,
        distinctions:  distinctions  ?? null,
        attrBody:      attrBody      ?? 0,
        attrCunning:   attrCunning   ?? 0,
        attrManners:   attrManners   ?? 0,
        attrSteel:     attrSteel     ?? 0,
        burdenDuty:    burdenDuty    ?? 0,
        burdenDesire:  burdenDesire  ?? 0,
        connections:   connections   ?? null,
        bonds:         bonds         ?? null,
        traits:        traits        ?? null,
        abilities:     abilities     ?? null,
        equipment:     equipment     ?? null,
      },
    });

    return res.status(201).json({ success: true, character });
  } catch (error) {
    console.error("[character.controller] createCharacter error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * GET /characters
 * Returns all characters belonging to the authenticated user.
 */
const getCharacters = async (req, res) => {
  try {
    const characters = await prisma.character.findMany({
      where: { userId: req.user.userId },
      orderBy: { name: "asc" },
    });

    return res.status(200).json({ success: true, characters });
  } catch (error) {
    console.error("[character.controller] getCharacters error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * GET /characters/:id
 * Returns a single character by ID.
 * Only accessible by the character's owner.
 */
const getCharacterById = async (req, res) => {
  const { id } = req.params;

  try {
    const character = await prisma.character.findUnique({
      where: { id },
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

    return res.status(200).json({ success: true, character });
  } catch (error) {
    console.error("[character.controller] getCharacterById error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * PUT /characters/:id
 * Updates a character.
 * Only accessible by the character's owner.
 */
const updateCharacter = async (req, res) => {
  const { id } = req.params;

  try {
    const character = await prisma.character.findUnique({
      where: { id },
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

    const updated = await prisma.character.update({
      where: { id },
      data: req.body,
    });

    return res.status(200).json({ success: true, character: updated });
  } catch (error) {
    console.error("[character.controller] updateCharacter error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * DELETE /characters/:id
 * Deletes a character.
 * Only accessible by the character's owner.
 */
const deleteCharacter = async (req, res) => {
  const { id } = req.params;

  try {
    const character = await prisma.character.findUnique({
      where: { id },
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

    await prisma.character.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Personnage supprimé.",
    });
  } catch (error) {
    console.error("[character.controller] deleteCharacter error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

module.exports = {
  createCharacter,
  getCharacters,
  getCharacterById,
  updateCharacter,
  deleteCharacter,
};