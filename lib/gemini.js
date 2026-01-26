import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const callGeminiAPI = async (question, agent) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Updated model name
      contents: `${agent.systemPrompt}\n\nQuestion:\n${question.title}\n\nDescription:\n${question.description}\n\nPlease provide a detailed answer:`,
    });

    // Ensure we have a valid response
    if (!response || !response.text || response.text.trim() === '') {
      throw new Error('AI returned empty response');
    }

    return response.text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`AI service error: ${error.message}`);
  }
};