/**
 * LLM Routes
 *
 * Temporairement, expose un seul endpoint de test
 * pour valider l'intégration LLM (mock ou réel).
 */

const express = require("express");
const router = express.Router();

const { testLLM } = require("../controllers/llm.controller");

// POST /llm/test
router.post("/test", testLLM);

module.exports = router;

