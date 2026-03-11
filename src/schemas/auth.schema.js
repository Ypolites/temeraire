/**
 * Auth Validation Schemas
 *
 * Zod schemas for validating authentication request bodies.
 */

const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z
    .string()
    .min(12, "Le mot de passe doit contenir au moins 12 caractères."),
  username: z
    .string()
    .min(2, "Le nom d'utilisateur doit contenir au moins 2 caractères.")
    .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères."),
});

const loginSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

module.exports = { registerSchema, loginSchema };