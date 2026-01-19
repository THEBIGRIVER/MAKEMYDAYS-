
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mood, events } = req.body;
  if (!mood) {
    return res.status(400).json({ error: 'Mood query is required' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const eventContext = (events || []).map(e => ({
      id: e.id,
      title: e.title,
      category: e.category,
      description: e.description
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `ACT AS A MOOD-BASED EXPERIENCE CURATOR.
      The user is feeling: "${mood}". 
      
      Suggest up to 3 events from the list below.
      Provide a punchy 1-sentence reasoning with an emoji.
      
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

    // Extracting text directly from property as per guidelines
    const recommendation = JSON.parse(response.text.trim());
    return res.status(200).json(recommendation);
  } catch (error) {
    console.error("Backend AI Error:", error);
    return res.status(500).json({ error: 'Failed to generate recommendations' });
  }
}
