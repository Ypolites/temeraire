/**
 * Character Validation Schemas
 */
const { z } = require("zod");

const speciesEnum = z.enum(["Human", "Dragon"]);
const pronounsEnum = z.enum(["He_him", "She_her", "They_them"]);

const createCharacterSchema = z.object({
  gameSessionId:  z.string().uuid("ID de session invalide."),
  species:        speciesEnum,
  name:           z.string().min(1, "Le nom est requis.").max(100),
  pronouns:       pronounsEnum,
  position:       z.string().min(1, "Le poste est requis.").max(100),
  appearance:     z.string().max(2000).optional(),
  nationality:    z.string().max(100).optional(),
  serviceRecord:  z.string().max(2000).optional(),
  station:        z.string().max(200).optional(),
  temperament:    z.string().max(200).optional(),
  distinctions:   z.string().max(2000).optional(),
  attrBody:       z.number().int().min(0).max(4).optional(),
  attrCunning:    z.number().int().min(0).max(4).optional(),
  attrManners:    z.number().int().min(0).max(4).optional(),
  attrSteel:      z.number().int().min(0).max(4).optional(),
  burdenDuty:     z.number().int().min(0).max(5).optional(),
  burdenDesire:   z.number().int().min(0).max(5).optional(),
  connections:    z.string().max(2000).optional(),
  bonds:          z.string().max(2000).optional(),
  traits:         z.string().max(2000).optional(),
  abilities:      z.string().max(2000).optional(),
  equipment:      z.string().max(2000).optional(),
});

const updateCharacterSchema = createCharacterSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Au moins un champ est requis pour la mise à jour." }
);

module.exports = { createCharacterSchema, updateCharacterSchema };