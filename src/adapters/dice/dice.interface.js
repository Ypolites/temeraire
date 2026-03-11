/**
 * Dice Adapter Interface
 *
 * Any dice provider must implement this interface.
 * Supports standard RPG notation: NdX+K (e.g. "2d6+3", "1d20-1")
 */

class DiceInterface {
    /**
     * Roll dice based on a command string.
     *
     * @param {string} command - e.g. "/roll 2d6+3"
     * @returns {Promise<{total: number, breakdown: string}>}
     *   breakdown example: "2d6+3 → [4, 2] + 3 = 9"
     */
    async roll(command) {
      throw new Error("roll() must be implemented by a concrete adapter");
    }
  }
  
  module.exports = DiceInterface;