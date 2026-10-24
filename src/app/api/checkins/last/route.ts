import { callFn } from '@/server/db';
import { handle, json, unauthorized } from '@/server/http';
import { isStaff } from '@/server/staff';
import type { GameState } from '@/types';

export const dynamic = 'force-dynamic';

/** DELETE /api/checkins/last?teamId=4 (staff) → removes that team's last step. */
export const DELETE = handle(async (req) => {
  if (!isStaff(req)) return unauthorized();
  const teamId = Number(new URL(req.url).searchParams.get('teamId'));
  if (!Number.isInteger(teamId)) return json({ error: 'invalid-request' }, 400);
  return json(await callFn<GameState>('undo_last', [teamId]));
});
