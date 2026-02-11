import type { VercelRequest, VercelResponse } from "@vercel/node";
import { INITIAL_EVENTS } from '../constants.ts';
import { Event } from '../types.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In a real app, this would fetch from a database (Prisma, Supabase, etc.)
  const events = INITIAL_EVENTS.map((e: Event) => ({
    ...e,
    price: Math.round(e.price * 0.2) // Applying standard discount logic server-side
  }));

  return res.status(200).json(events);
}