/**
 * Dice Routes
 *
 * POST /dice/roll — roll dice based on a command string
 */
const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate.middleware");
const { rollSchema } = require("../schemas/dice.schema");
const { roll } = require("../controllers/dice.controller");

router.post("/roll", validate(rollSchema), roll);

module.exports = router;