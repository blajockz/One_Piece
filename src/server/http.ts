import { NextResponse } from 'next/server';

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export const unauthorized = () => json({ error: 'unauthorized' }, 401);

/** Wraps a handler: any unexpected error becomes a clean 500 JSON. */
export function handle(fn: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      return await fn(req);
    } catch (err) {
      console.error(err);
      return json({ error: 'server-error' }, 500);
    }
  };
}
