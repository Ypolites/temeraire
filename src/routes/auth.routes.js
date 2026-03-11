/**
 * Auth Routes
 *
 * POST /auth/register — create a new user account
 * POST /auth/login    — authenticate and receive a JWT
 */

const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate.middleware");
const { registerSchema, loginSchema } = require("../schemas/auth.schema");
const { register, login } = require("../controllers/auth.controller");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

module.exports = router;