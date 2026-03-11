/**
 * Game Session Routes
 *
 * POST   /sessions      — create a session
 * GET    /sessions      — list own sessions
 * GET    /sessions/:id  — get one session
 * DELETE /sessions/:id  — delete a session
 */

const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createSessionSchema } = require("../schemas/session.schema");
const {
  createSession,
  getSessions,
  getSessionById,
  deleteSession,
} = require("../controllers/session.controller");

router.post("/", authenticate, validate(createSessionSchema), createSession);
router.get("/", authenticate, getSessions);
router.get("/:id", authenticate, getSessionById);
router.delete("/:id", authenticate, deleteSession);

// Export direct du router (fonction)
module.exports = router;
