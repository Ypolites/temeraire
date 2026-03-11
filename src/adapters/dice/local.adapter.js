/**
 * Local Dice Adapter
 *
 * Implements DiceInterface using pure JavaScript (no external API).
 * Supports notation: NdX+K and NdX-K (e.g. "1d20+2", "2d6-1")
 */

const DiceInterface = require("./dice.interface");

class LocalDiceAdapter extends DiceInterface {
  /**
   * Parse and roll a dice command.
   *
   * @param {string} command - e.g. "/roll 2d6+3"
   * @returns {Promise<{total: number, breakdown: string}>}
   */
  async roll(command) {
    const parsed = this._parseCommand(command);
    const rolls = this._rollDice(parsed.count, parsed.sides);
    const total = rolls.reduce((sum, r) => sum + r, 0) + parsed.modifier;

    const breakdown = `${parsed.count}d${parsed.sides}${parsed.modifierDisplay} → [${rolls.join(", ")}] ${parsed.modifierDisplay} = ${total}`;

    return { total, breakdown };
  }

  /**
   * Parse a command string into its components.
   * Accepts: "/roll NdX", "/roll NdX+K", "/roll NdX-K"
   *
   * @param {string} command
   * @returns {{count: number, sides: number, modifier: number, modifierDisplay: string}}
   */
  _parseCommand(command) {
    const clean = command.trim().replace(/^\/roll\s*/i, "");
    const match = clean.match(/^(\d+)d(\d+)([+-]\d+)?$/i);

    if (!match) {
      throw new Error(`Commande invalide : "${command}". Format attendu : /roll NdX+K`);
    }

    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;
    const modifierDisplay = modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : "";

    if (count < 1 || count > 20) {
      throw new Error("Le nombre de dés doit être entre 1 et 20.");
    }
    if (![4, 6, 8, 10, 12, 20, 100].includes(sides)) {
      throw new Error(`Dé invalide : d${sides}. Valeurs acceptées : d4, d6, d8, d10, d12, d20, d100.`);
    }

    return { count, sides, modifier, modifierDisplay };
  }

  /**
   * Roll a single die with the given number of sides.
   *
   * @param {number} count
   * @param {number} sides
   * @returns {number[]}
   */
  _rollDice(count, sides) {
    return Array.from({ length: count }, () =>
      Math.floor(Math.random() * sides) + 1
    );
  }
}

module.exports = LocalDiceAdapter;