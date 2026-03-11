/**
 * Dice Singleton
 *
 * Reads DICE_PROVIDER from .env and returns the matching adapter.
 * Defaults to "local" if DICE_PROVIDER is not set.
 */

const provider = process.env.DICE_PROVIDER || "local";

let adapter;

if (provider === "local") {
  const LocalDiceAdapter = require("../adapters/dice/local.adapter");
  adapter = new LocalDiceAdapter();
} else {
  throw new Error(
    `Unknown or unsupported DICE_PROVIDER: "${provider}". Currently supported: "local".`
  );
}

module.exports = adapter;