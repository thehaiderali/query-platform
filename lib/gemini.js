import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export const callGeminiAPI = async (question, agent) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${agent.systemPrompt}\n\nQuestion:\n${question.description}`,
  });

  return response.text;
};
