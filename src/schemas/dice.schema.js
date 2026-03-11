/**
 * Dice Validation Schemas
 */
const { z } = require("zod");

const rollSchema = z.object({
  command: z
    .string()
    .min(1, "La commande est requise.")
    .regex(
      /^(\/roll\s+)?\d+d\d+([+-]\d+)?$/i,
      "Format invalide. Exemples : /roll 2d6+3, 1d20, 1d8-1"
    ),
});

module.exports = { rollSchema };