const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
// Note: We use a placeholder key here if process.env.GEMINI_API_KEY is not set, 
// so the app won't crash, but you must provide a real key in .env for it to work.
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyPlaceholderKeyForDevelopmentPleaseReplace';
const genAI = new GoogleGenerativeAI(apiKey);

router.post('/refine', async (req, res) => {
  try {
    const { rawSentence, targetLanguage = 'en' } = req.body;
    
    if (!rawSentence) {
      return res.status(400).json({ error: 'Raw sentence is required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
    You are an advanced Sign Language translator and refiner.
    Sign language (like ASL) is often highly conceptual and lacks standard connecting words (e.g., "I hungry" instead of "I am hungry").
    
    Your job is to take the raw sequence of detected signs/words, and convert them into a perfectly natural, grammatically correct sentence.
    
    Additionally, the user has requested the output to be translated to the language code: "${targetLanguage}".
    If the language code is "en", output English. If "es", output Spanish. If "ja", output Japanese, etc.
    
    Raw Sign Sequence: "${rawSentence}"
    
    Only return the final refined translated sentence, nothing else. No quotation marks, no explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ refinedSentence: text.trim() });
  } catch (error) {
    console.error('AI Refinement Error:', error);
    res.status(500).json({ 
      error: 'Failed to refine sentence. Please check your Gemini API Key.',
      details: error.message 
    });
  }
});

module.exports = router;
