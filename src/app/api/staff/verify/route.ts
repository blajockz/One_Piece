import { handle, json, unauthorized } from '@/server/http';
import { isStaff } from '@/server/staff';

export const dynamic = 'force-dynamic';

/** POST /api/staff/verify (header X-Staff-Pin) → 200 or 401. */
export const POST = handle(async (req) => (isStaff(req) ? json({ ok: true }) : unauthorized()));
