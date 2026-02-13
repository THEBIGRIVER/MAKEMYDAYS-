
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";
import { Event } from "../types.ts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mood, events } = req.body;
  if (!mood) {
    return res.status(400).json({ error: 'Mood query is required' });
  }

  if (!process.env.API_KEY) {
    return res.status(500).json({ error: 'Internal server configuration error' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const eventContext = (events || []).map((e: Event) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      description: e.description
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `ACT AS AN EXPERT MOOD-BASED EXPERIENCE CURATOR.
      
      USER CURRENT STATE: "${mood}"
      
      AVAILABLE EXPERIENCES: ${JSON.stringify(eventContext)}
      
      INSTRUCTIONS:
      1. Analyze the psychological and physical needs implied by the user's mood.
      2. Select EXACTLY 1 to 3 event IDs from the list that provide the best remedy or match.
      3. Provide a high-impact, empathetic 1-sentence reasoning starting with a relevant emoji.
      4. Crucial: The "suggestedEventIds" MUST be strings that exactly match the IDs provided in the context.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { 
              type: Type.STRING,
              description: "A short, engaging explanation of why these experiences were chosen for this specific mood."
            },
            suggestedEventIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The list of IDs for the suggested events. Must be from the provided context."
            }
          },
          required: ["reasoning", "suggestedEventIds"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    const recommendation = JSON.parse(text.trim());
    return res.status(200).json(recommendation);
  } catch (error: any) {
    console.error("Backend AI Error:", error);
    return res.status(500).json({ error: 'Failed to generate recommendations' });
  }
}
