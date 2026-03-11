/**
 * Auth Controller
 *
 * Handles user registration and login.
 * Uses bcrypt for password hashing and JWT for session tokens.
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const SALT_ROUNDS = 12;

/**
 * POST /auth/register
 * Creates a new user account.
 */
const register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        errors: ["Cet email est déjà utilisé."],
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, username, passwordHash },
    });

    return res.status(201).json({
      success: true,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.error("[auth.controller] register error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * POST /auth/login
 * Authenticates a user and returns a JWT.
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        errors: ["Email ou mot de passe incorrect."],
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        errors: ["Email ou mot de passe incorrect."],
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.error("[auth.controller] login error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

/**
 * POST /auth/reset-password
 * Updates the password for an existing user.
 * Simplified flow (no email token) — to be upgraded in Phase 8.
 */
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        errors: ["Aucun compte associé à cet email."],
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        errors: ["Le nouveau mot de passe doit être différent de l'ancien."],
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[auth.controller] resetPassword error:", error);
    return res.status(500).json({
      success: false,
      errors: ["Erreur serveur. Veuillez réessayer."],
    });
  }
};

module.exports = { register, login, resetPassword };