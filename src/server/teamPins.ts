import { timingSafeEqual } from 'node:crypto';

/**
 * Team PINs (server only, never sent to the browser).
 * Override with the TEAM_PINS environment variable: "1:4827,2:1593,3:7360,..."
 */
const DEFAULT_PINS: Record<number, string> = {
  1: '4827', 2: '1593', 3: '7360', 4: '2948', 5: '8615', 6: '3172', 7: '6039', 8: '5481',
};

function pins(): Record<number, string> {
  const raw = process.env['TEAM_PINS']?.trim();
  if (!raw) return DEFAULT_PINS;
  const out: Record<number, string> = {};
  for (const part of raw.split(',')) {
    const [id, pin] = part.split(':').map((s) => s.trim());
    if (id && pin) out[Number(id)] = pin;
  }
  return out;
}

export function isTeamPin(teamId: number, given: unknown): boolean {
  const expected = pins()[teamId];
  if (!expected || typeof given !== 'string') return false;
  const a = Buffer.from(given.trim());
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Slows down PIN guessing (each wrong try waits a bit). */
export const wrongPinDelay = () => new Promise((r) => setTimeout(r, 800));
