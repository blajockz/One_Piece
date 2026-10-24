import { timingSafeEqual } from 'node:crypto';

/**
 * Staff code check. The code is set with the STAFF_PIN environment variable (never sent to the browser).
 * Staff actions (start, reset, undo, manual check-ins, Salle du Trésor) need the header X-Staff-Pin.
 */
export function isStaff(req: Request): boolean {
  return checkPin(req.headers.get('x-staff-pin'));
}

export function checkPin(given: string | null | undefined): boolean {
  const expected = process.env['STAFF_PIN']?.trim();
  if (!expected) {
    console.error('STAFF_PIN is not set: all staff actions are refused.');
    return false;
  }
  if (!given) return false;
  const a = Buffer.from(given.trim());
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
