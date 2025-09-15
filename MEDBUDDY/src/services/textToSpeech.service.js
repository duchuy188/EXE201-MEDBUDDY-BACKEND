const axios = require('axios');

class TextToSpeechService {
  static async generateSpeech(text, options = {}) {
    try {
      const API_KEY = process.env.FPT_AI_API_KEY;
      if (!API_KEY) {
        throw new Error('FPT AI API key is not configured');
      }

      const voice = options.voice || 'banmai';
      const speed = options.speed || 0;

      const response = await axios.post(
        'https://api.fpt.ai/hmi/tts/v5',
        text,
        {
          headers: {
            'api-key': API_KEY,
            'voice': voice,
            'speed': speed,
            'Content-Type': 'text/plain'
          }
        }
      );

      if (response.data && response.data.async) {
        return {
          success: true,
          audioUrl: response.data.async // FPT.AI trả về URL trực tiếp trong trường async
        };
      } else {
        throw new Error('Invalid response from FPT.AI TTS service');
      }
    } catch (error) {
      console.error('Text-to-speech generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = TextToSpeechService;