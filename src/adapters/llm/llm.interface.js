/**
 * LLM Adapter Interface
 *
 * Any LLM provider must implement this interface.
 * Controllers only depend on this contract, never on a specific provider.
 */

class LLMInterface {
    /**
     * Send a conversation to the LLM and get a response.
     *
     * @param {Array<{role: "user"|"assistant", content: string}>} messages
     * @param {string} systemPrompt - Instructions for the AI Game Master
     * @param {string|null} [sessionId] - Optional GameSession identifier for logging
     * @returns {Promise<{ text: string, usage: any, summaryTriggered: boolean }>}
     */
    async sendMessage(messages, systemPrompt, sessionId = null) {
      throw new Error("sendMessage() must be implemented by a concrete adapter");
    }
  }
  
  module.exports = LLMInterface;