# Deploying the YSSE API to Render

`npm run build` and a `/api/health` smoke test (production `node dist/index.js`)
already pass locally. This repo ships a Render Blueprint.

## Fastest path (5 minutes + env values)

1. Go to **https://dashboard.render.com** → **New → Blueprint** → connect
   `shahed-hassan-fz-rabbi/Ysse-Mian-Portale-Backend` (branch `main`).
2. Render reads `render.yaml` automatically: Node runtime,
   build `npm ci && npm run build`, start `npm run start`,
   health check `/api/health`.
3. Render will ask for the three `sync:false` variables:

   | Name | Where to get the value |
   |------|------------------------|
   | `SUPABASE_URL` | Supabase → Project Settings → API → **Project URL** |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role** secret (server-only) |
   | `FRONTEND_URL` | The deployed Vercel origin, e.g. `https://ysse-....vercel.app` (comma-separated extra origins allowed) |

4. Apply → Render builds and starts. The **PORT** is provided by Render;
   the app binds `process.env.PORT` automatically.
5. Verify **https://<render-url>/api/health** → 200 `database: connected`.

## Notes

- CORS: the backend allowlists exactly `FRONTEND_URL` (multiple comma-separated
  origins supported). Update `FRONTEND_URL` whenever the frontend URL
  changes — env changes on Render trigger an automatic redeploy.
- Supabase dashboard: run `backend/migrations/004_contact_messages.sql` after
  001–003 if not done yet, and optionally `backend/seed/demo_seed.sql`.
- All admin authorization is enforced server-side against `profiles.role`
  (client state is convenience only) — nothing to configure extra.
