import { GoogleGenAI, Chat } from "@google/genai";
import { INITIAL_EVENTS } from "../constants.ts";

export class ChatService {
  private ai: GoogleGenAI | null = null;
  private chat: Chat | null = null;

  private getClient() {
    if (!this.ai) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return this.ai;
  }

  private initChat() {
    const eventContext = INITIAL_EVENTS.map(e => `${e.title} (${e.category}): ${e.description}`).join('\n');
    const ai = this.getClient();
    
    this.chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are the MAKEMYDAYS AI Concierge. 
        You help users find unconventional wellness, entertainment shows, high-energy natural activities, Mindfulness sessions, and creative Workshops.
        
        Available Experiences:
        ${eventContext}
        
        Guidelines:
        - Be high-energy, empathetic, and slightly "radical" in your wellness approach.
        - Encourage users to "calibrate their frequency."
        - If they ask about events, recommend specific ones from the list above.
        - Keep responses concise and punchy. Use emojis sparingly but effectively.
        - Your tone is premium, modern, and grounded.`,
      },
    });
  }

  async sendMessage(message: string) {
    if (!this.chat) {
      this.initChat();
    }
    
    try {
      const result = await this.chat!.sendMessage({ message });
      return result.text;
    } catch (error) {
      console.error("Chat error:", error);
      return "My frequency is currently disrupted. Let's try recalibrating in a moment.";
    }
  }
}

export const chatService = new ChatService();