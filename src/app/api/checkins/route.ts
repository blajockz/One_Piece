import { callFn } from '@/server/db';
import { handle, json, unauthorized } from '@/server/http';
import { isValidToken } from '@/server/qr';
import { isStaff } from '@/server/staff';
import { isTeamPin, wrongPinDelay } from '@/server/teamPins';
import type { CheckinResult } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/checkins
 *  - team:  { teamId, target: 1..5, source: "team", token, pin }  → token = code of that checkpoint's QR, pin = team PIN
 *  - staff: { teamId, target, source: "staff" } + header X-Staff-Pin  (manual check-in, Salle du Trésor)
 * Game rules + server time are applied in the database.
 */
export const POST = handle(async (req) => {
  let body: { teamId?: unknown; target?: unknown; source?: unknown; token?: unknown; pin?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid-json' }, 400);
  }
  const teamId = Number(body.teamId);
  const target = String(body.target);
  const source = body.source === 'staff' ? 'staff' : 'team';
  if (!Number.isInteger(teamId) || !['1', '2', '3', '4', '5', 'SALLE'].includes(target)) {
    return json({ error: 'invalid-request' }, 400);
  }

  if (source === 'staff') {
    if (!isStaff(req)) return unauthorized();
  } else {
    if (!isTeamPin(teamId, body.pin)) {
      await wrongPinDelay();
      return json({ ok: false, reason: 'wrong-pin' }, 409);
    }
    if (target === 'SALLE') return json({ ok: false, reason: 'salle-too-early' }, 409);
    const token = typeof body.token === 'string' ? body.token : null;
    if (!isValidToken(Number(target), token)) return json({ ok: false, reason: 'expired-qr' }, 409);
  }

  const result = await callFn<CheckinResult>('register_checkin', [teamId, target, source]);
  return json(result, result.ok ? 200 : 409);
});
