/**
 * Game Session Validation Schemas
 */
const { z } = require("zod");

const createSessionSchema = z.object({
  name: z.string().min(1, "Le nom de la session est requis.").max(100),
});

const updateSessionSchema = createSessionSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Au moins un champ est requis pour la mise à jour." }
);

module.exports = { createSessionSchema, updateSessionSchema };