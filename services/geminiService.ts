
import { GoogleGenAI, Type } from "@google/genai";
import { Event } from "../types";

// Always use the API key directly from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIRecommendations = async (userMood: string, allEvents: Event[]) => {
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
    // Extract text directly from the response.text property.
    const text = response.text || "{}";
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("AI parse error", error);
    return null;
  }
};

export const getSmartSummary = async (event: Event) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a compelling 2-sentence marketing summary for this event: ${event.title}. Category: ${event.category}. Description: ${event.description}. Focus on why someone should attend.`,
  });
  // Use the .text property to get the generated text output.
  return response.text;
};
