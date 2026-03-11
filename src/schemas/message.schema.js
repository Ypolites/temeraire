/**
 * Message Validation Schemas
 */
const { z } = require("zod");

const moodEnum = z.enum([
  "neutral", "happy", "sad", "angry",
  "scared", "surprised", "determined",
  "hurt", "mocking", "focus",
]);

const createMessageSchema = z.object({
  content:      z.string().min(1, "Le message ne peut pas être vide.").max(10000),
  caption:      z.string().max(200).optional(),
  selectedMood: moodEnum.optional(),
});

module.exports = { createMessageSchema };