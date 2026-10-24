import { handle, json } from '@/server/http';
import { isTeamPin, wrongPinDelay } from '@/server/teamPins';

export const dynamic = 'force-dynamic';

/** POST /api/teams/verify { teamId, pin } → 200 or 401. Used when a phone picks its team. */
export const POST = handle(async (req) => {
  let body: { teamId?: unknown; pin?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid-json' }, 400);
  }
  if (isTeamPin(Number(body.teamId), body.pin)) return json({ ok: true });
  await wrongPinDelay();
  return json({ error: 'wrong-pin' }, 401);
});
