/**
 * Message Routes
 *
 * POST  /sessions/:id/messages  — send a message
 * GET   /sessions/:id/messages  — list messages (paginated)
 */
const express = require("express");
const router = express.Router({ mergeParams: true });
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createMessageSchema } = require("../schemas/message.schema");
const { createMessage, getMessages } = require("../controllers/message.controller");

router.post("/", authenticate, validate(createMessageSchema), createMessage);
router.get("/", authenticate, getMessages);

module.exports = router;