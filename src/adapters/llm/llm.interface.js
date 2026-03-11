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
     * @returns {Promise<string>} - The AI response text
     */
    async sendMessage(messages, systemPrompt) {
      throw new Error("sendMessage() must be implemented by a concrete adapter");
    }
  }
  
  module.exports = LLMInterface;