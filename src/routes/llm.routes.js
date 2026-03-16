/**
 * LLM Routes
 *
 * Temporairement, expose un seul endpoint de test
 * pour valider l'intégration LLM (mock ou réel).
 */

const express = require("express");
const router = express.Router();

const { testLLM, testLLMStream } = require("../controllers/llm.controller");

// POST /llm/test — réponse JSON complète
router.post("/test", testLLM);

// GET /llm/test/stream — Server-Sent Events (SSE)
router.get("/test/stream", testLLMStream);

module.exports = router;

