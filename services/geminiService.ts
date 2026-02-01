import { GoogleGenAI, Type } from "@google/genai";
import { Event, AIRecommendation } from "../types.ts";

export const getAIRecommendations = async (userMood: string, allEvents: Event[]): Promise<AIRecommendation | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const eventContext = allEvents.map(e => ({
    id: e.id,
    title: e.title,
    category: e.category,
    description: e.description,
    price: e.price
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `ACT AS A MOOD-BASED EXPERIENCE CURATOR.
      The user is currently feeling: "${userMood}". 
      
      YOUR TASK:
      1. Analyze the user's mood.
      2. Select 1 to 3 events from the list below that would either COMPLEMENT or IMPROVE their current state.
      3. For "Stressed" or "Tired", prioritize Wellness/Mindfulness/Therapy.
      4. For "Bored" or "Energetic", prioritize Activity/Adventure/Shows/Workshops/Creative Arts.
      5. Provide a highly empathetic and punchy 1-sentence reasoning.
      
      Events available: ${JSON.stringify(eventContext)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { 
              type: Type.STRING,
              description: "A short, engaging explanation starting with an emoji."
            },
            suggestedEventIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "IDs of the most relevant events."
            }
          },
          required: ["reasoning", "suggestedEventIds"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("AI recommendation failed:", error);
    return null;
  }
};