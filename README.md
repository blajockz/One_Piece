# Chasse au Trésor — suivi en direct (Next.js full-stack + Neon)

One Next.js app = the website **and** the API. Database: Postgres (Neon), created automatically.

| Page | For | |
|---|---|---|
| `/` | Big screen | Live map + ranking |
| `/checkin` | Team phones | Team + PIN, then validate the scanned checkpoint |
| `/staff` | Organizers (staff code) | Start, follow, manual check-in / undo, reset |
| `/staff/qr` | Volunteers (staff code) | Pick CP1–CP5 → QR of that checkpoint (changes every minute) |

## Deploy on Vercel (≈5 min)

1. Push this folder to GitHub → **vercel.com → Add New → Project** → import it.
2. Before deploying, in **Settings → Environment Variables** add:
   - `STAFF_PIN` = staff code (e.g. `464923`)
   - optional: `TEAM_PINS`, `NEXT_PUBLIC_SITE_URL` (see `.env.example`)
3. **Storage → Create Database → Neon (Postgres)** → connect it to this project.
   Vercel adds `DATABASE_URL` automatically.
4. **Deploy** (or Redeploy). The build runs `scripts/db-setup.mjs`, which creates the tables, the 8 teams
   and the game functions. Re-running it never deletes data.
5. Open `https://<your-app>.vercel.app/staff`, enter the staff code, then use `/staff/qr`.

## Run locally

```bash
npm install
cp .env.example .env.local   # put your Neon DATABASE_URL (Vercel → Storage → Neon → .env.local tab) + STAFF_PIN
npm run db:setup             # create the tables (once)
npm run dev                  # http://localhost:3000
```
Phones on the same Wi-Fi: open the **Network** address printed by `npm run dev` (e.g. `http://192.168.1.90:3000`).

## Team PINs (default)

| Équipe | 1 Rouge | 2 Bleu | 3 Vert | 4 Jaune | 5 Orange | 6 Violet | 7 Rose | 8 Turquoise |
|---|---|---|---|---|---|---|---|---|
| PIN | 4827 | 1593 | 7360 | 2948 | 8615 | 3172 | 6039 | 5481 |

Change them with `TEAM_PINS=1:1111,2:2222,…`.

## Files

```
db/schema.sql              Tables, 8 teams, game rules (SQL functions) — idempotent
scripts/db-setup.mjs       Applies db/schema.sql (runs before every build, or `npm run db:setup`)
src/app/                   Pages (/, /checkin, /staff, /staff/qr) + API routes (src/app/api/*)
src/server/                Server only: db.ts (Postgres), staff.ts, teamPins.ts, qr.ts
src/views, src/components  The screens (unchanged)
src/config/game.ts         Teams, colors, routes, checkpoint positions on the map
```

Teams/routes live in two places: `src/config/game.ts` and `db/schema.sql`. Change both together.
