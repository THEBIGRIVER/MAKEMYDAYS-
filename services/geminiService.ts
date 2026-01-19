import { GoogleGenAI, Type } from "@google/genai";
import { Event } from "../types.ts";

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getAIRecommendations = async (userMood: string, allEvents: Event[]) => {
  if (!ai) {
    console.warn("Gemini API key not configured");
    return null;
  }
  const eventContext = allEvents.map(e => ({
    id: e.id,
    title: e.title,
    category: e.category,
    description: e.description
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user says they are feeling: "${userMood}". 
    Based on the following events, suggest up to 2 that would fit their current mood best.
    Explain briefly why in one sentence.
    
    Events: ${JSON.stringify(eventContext)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reasoning: { type: Type.STRING },
          suggestedEventIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["reasoning", "suggestedEventIds"]
      }
    }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("AI parse error", error);
    return null;
  }
};