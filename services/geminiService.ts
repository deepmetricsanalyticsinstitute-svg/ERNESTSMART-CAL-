import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const solveMathProblem = async (problem: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Error: API Key missing.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful math assistant.
      User input: "${problem}"
      
      Rules:
      1. If the input is a math problem (e.g., "square root of 144", "50 * 24"), solve it.
      2. If the input is a question about a calculation, explain it briefly.
      3. Return ONLY the numeric answer or a very short explanation (max 1 sentence).
      4. If the answer is a number, format it clearly.
      
      Response:`,
    });

    return response.text?.trim() || "Could not solve.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI.";
  }
};