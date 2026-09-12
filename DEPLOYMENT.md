# Deploying KaushalSetu

Everything below assumes you're moving off `localhost` for the first time.
Read the **Before you go public** section first — some of it is not optional.

---

## Before you go public

These are things that are fine on your laptop and not fine on the internet.

### 1. Turn off the demo identity

```
ALLOW_DEMO_IDENTITY=false
```

While this is `true`, an unauthenticated API call is answered as a demo
account. Anyone who finds your API URL can read trainee data without signing
in. **This is the single most important line in this document.**

### 2. Close government self-registration

```
SELF_REGISTER_ROLES=trainee,employer
```

Otherwise anyone can create a government account and open state-wide
intelligence, district performance and early warnings.

### 3. Generate a real secret key

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

Put that in `JWT_SECRET_KEY`. Never commit it. Anyone with this value can mint
tokens for any account.

### 4. Do not deploy the seeded 10,000 trainees as if they were real

They're synthetic. That's fine for a demo deployment, but the moment a real
person signs up, your dataset is a mix of real and fake records with no column
distinguishing them. If this becomes a real service, seed a clean database.

### 5. Relabel the DigiLocker stub

The verification endpoint marks an account verified based on whatever JSON it
receives. On a public site that badge is a false claim about a real business.
Either label it clearly as a demo or remove the badge.

### 6. Things that don't exist yet

Be aware you're shipping without: password reset, email verification, rate
limiting on the login endpoint, and audit logging. None of them block a demo
deployment. All of them matter for a real one.

---

## The shape of the deployment

Four things need somewhere to live:

| Piece | What it is | Where it goes |
|---|---|---|
| PostgreSQL | your `skillgrow` database | managed Postgres |
| FastAPI backend | the API **and** the sign-in page | a container/web service host |
| 3 panels | static files after `npm run build` | static hosting / CDN |
| Landing page | static files | static hosting / CDN |

The panels and landing page are just HTML, CSS and JS after a build. They need
no server of their own.

---

## Recommended stack (free tiers, fastest path)

- **Database** — [Neon](https://neon.tech) or [Supabase](https://supabase.com).
  Both give you a free Postgres with a connection string.
- **Backend** — [Render](https://render.com) or [Railway](https://railway.app).
  Both deploy a FastAPI app from a GitHub repo with no Dockerfile needed.
- **Frontends** — [Vercel](https://vercel.com), [Netlify](https://netlify.com)
  or Cloudflare Pages. Each panel is a separate project pointing at a
  subdirectory.

Free tiers sleep after inactivity, so the first request after a quiet period
takes 30-60 seconds. **If you're demoing to judges over the internet, open the
site five minutes beforehand to wake it up.**

---

## Step 1 — Database

1. Create a Postgres instance and copy the connection string.
2. Load your dump into it:

```bash
psql "<your-connection-string>" -f database/skillgrow_full_backup.sql
```

3. Confirm it landed:

```bash
psql "<your-connection-string>" -c "SELECT COUNT(*) FROM trainees;"
```

You should see 10000.

Managed Postgres requires SSL. If SQLAlchemy complains, append
`?sslmode=require` to the URL.

---

## Step 2 — Backend

Push the repo to GitHub first. Make sure `.env` is **not** committed —
add a `.gitignore` containing at least:

```
.env
venv/
node_modules/
__pycache__/
*.pyc
dist/
```

On Render: New → Web Service → connect the repo.

- **Root directory:** `backend`
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

The `$PORT` part matters — the host assigns the port, you don't choose it.

Environment variables to set in the dashboard (not in a file):

```
DATABASE_URL=postgresql+psycopg2://...      # from step 1
JWT_SECRET_KEY=<the generated secret>
ALLOW_DEMO_IDENTITY=false
SELF_REGISTER_ROLES=trainee,employer
CORS_ORIGINS=https://trainee.yourdomain.com,https://centre.yourdomain.com,https://gov.yourdomain.com
TRAINEE_PANEL_URL=https://trainee.yourdomain.com
EMPLOYER_PANEL_URL=https://centre.yourdomain.com
GOV_PORTAL_URL=https://gov.yourdomain.com
ENABLE_ML=true
ALLOW_DB_WRITES=true
```

`CORS_ORIGINS` must list your real frontend URLs. Leave the localhost defaults
in place and every panel call fails with a CORS error in production.

Check it worked: `https://your-api.onrender.com/api/health` should report
`"database": "connected"` with your row counts.

---

## Step 3 — Frontends

Each panel is a separate deployment. On Vercel: New Project → same repo →
set the root directory.

| Panel | Root directory | Build | Output |
|---|---|---|---|
| Trainee | `frontend/trainee-panel` | `npm run build` | `dist` |
| Training centre | `frontend/employer-panel` | `npm run build` | `dist` |
| Government | `frontend/gov-portal` | `npm run build` | `dist` |
| Landing | wherever you keep it | `npm run build` | `dist` |

Environment variables for each panel:

```
VITE_API_BASE_URL=https://your-api.onrender.com        # gov portal: add /api
VITE_LOGIN_URL=https://your-api.onrender.com/
VITE_USE_MOCK=false
VITE_BYPASS_AUTH=false
VITE_NO_FALLBACK=false
```

Note the gov portal's base URL includes `/api` — it always has; the other two
panels append it themselves.

And in the landing page's `src/main.jsx`, change `signInBase` to your API URL.

**Vite bakes these in at build time, not at run time.** Change one and you
must redeploy for it to take effect.

---

## Step 4 — Check the whole path

1. Open the landing page.
2. Click "Create trainee account" → you should land on the sign-in page with
   the trainee role selected and the register tab open.
3. Register → you should be forwarded to the trainee panel, signed in.
4. Sign out → back to the sign-in page.
5. Repeat for the training centre.
6. Open a panel URL directly in a private window — you should be bounced to
   sign-in, not shown data. **If you see data, `ALLOW_DEMO_IDENTITY` is still
   on.**

---

## One thing worth fixing if this becomes real

The panels are on three different origins, so the sign-in page hands the token
over in the URL fragment. It works, and fragments never reach a server, but
the token does pass through the address bar.

Putting everything behind **one domain** removes that entirely:

```
kaushalsetu.in/            → landing
kaushalsetu.in/trainee/    → trainee panel
kaushalsetu.in/centre/     → training centre panel
kaushalsetu.in/gov/        → government portal
kaushalsetu.in/api/        → backend
```

Same origin means one `localStorage`, or better, an httpOnly session cookie
that JavaScript can't read at all. Both Vercel and Netlify can do this with
rewrite rules, and Cloudflare can do it in front of anything.

Not a hackathon job. The right first task if the project continues.

---

## Cost, roughly

Free tiers cover all of this for a demo, with the sleep caveat above. If you
outgrow them: managed Postgres from about $5-7/month, a backend service that
doesn't sleep from about $7/month, static hosting free at your scale, and a
`.in` domain around ₹800/year.
