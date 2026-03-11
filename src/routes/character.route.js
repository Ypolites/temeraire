/**
 * Character Routes
 *
 * POST   /characters      — create a character
 * GET    /characters      — list own characters
 * GET    /characters/:id  — get one character
 * PUT    /characters/:id  — update a character
 * DELETE /characters/:id  — delete a character
 */
const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createCharacterSchema, updateCharacterSchema } = require("../schemas/character.schema");
const {
  createCharacter,
  getCharacters,
  getCharacterById,
  updateCharacter,
  deleteCharacter,
} = require("../controllers/character.controller");

router.post("/", authenticate, validate(createCharacterSchema), createCharacter);
router.get("/", authenticate, getCharacters);
router.get("/:id", authenticate, getCharacterById);
router.put("/:id", authenticate, validate(updateCharacterSchema), updateCharacter);
router.delete("/:id", authenticate, deleteCharacter);

module.exports = router;