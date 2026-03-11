/**
 * Auth Routes
 *
 * POST /auth/register       — create a new user account
 * POST /auth/login          — authenticate and receive a JWT
 * POST /auth/reset-password — update password (simplified flow)
 */
const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate.middleware");
const { registerSchema, loginSchema, resetPasswordSchema } = require("../schemas/auth.schema");
const { register, login, resetPassword } = require("../controllers/auth.controller");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

module.exports = router;