import { INITIAL_EVENTS } from '../constants.ts';

type ApiRequest = { method: string; body?: any };
type ApiResponse = { status: (code: number) => ApiResponse; json: (data: any) => ApiResponse };

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In a real app, this would fetch from a database (Prisma, Supabase, etc.)
  const events = INITIAL_EVENTS.map(e => ({
    ...e,
    price: Math.round(e.price * 0.2) // Applying standard discount logic server-side
  }));

  return res.status(200).json(events);
}