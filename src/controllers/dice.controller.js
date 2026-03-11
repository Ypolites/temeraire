/**
 * Dice Controller
 *
 * Handles dice roll requests.
 * Uses the dice adapter configured in DICE_PROVIDER (.env).
 */
const dice = require("../lib/dice");

/**
 * POST /dice/roll
 * Rolls dice based on a command string.
 */
const roll = async (req, res) => {
  const { command } = req.body;

  try {
    const result = await dice.roll(command);

    return res.status(200).json({
      success: true,
      command,
      total: result.total,
      breakdown: result.breakdown,
    });
  } catch (error) {
    console.error("[dice.controller] roll error:", error.message);
    return res.status(400).json({
      success: false,
      errors: [error.message],
    });
  }
};

module.exports = { roll };