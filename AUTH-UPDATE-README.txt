KaushalSetu — login & registration update
=========================================

This archive contains ONLY the files that changed or are new since the first
integrated build. Everything else in your project is untouched.

HOW TO APPLY
------------
1. Close the backend and all three `npm run dev` terminals.

2. Extract this zip so that its `KaushalSetu` folder lands on top of your
   existing one:

     C:\Users\Prakash\Downloads\KaushalSetu-integrated (2)\KaushalSetu

   Windows will ask whether to replace existing files — choose
   "Replace the files in the destination". That is what you want: the 35
   files here are the updated versions.

   Your backend\.env is NOT in this archive, so your database password and
   settings survive untouched.

3. Restart the backend:

     cd backend
     python -m uvicorn app.main:app --reload --port 8000

4. Restart each panel (no `npm install` needed — no new packages were added):

     npm run dev

5. Open any panel. You'll be redirected to /login.

WHAT CHANGED (35 files)
-----------------------
Backend (5)
  app/api/auth.py       registration allow-list, 8-char minimum password
  app/api/deps.py       get_current_government guard
  app/api/gov.py        government guard applied to every /api/gov route
  app/core/config.py    SELF_REGISTER_ROLES setting
  tests/smoke_test.py   67 checks (was 59) — registration flows added

Trainee panel (9)   login + registration, ProtectedRoute, sign-out in sidebar
Employer panel (7)  login + registration tab, role check, dev bypass moved to .env
Government portal (9)  login + access request, ProtectedRoute, sign-out in header
Docs (2)            README.md, INTEGRATION.md

TWO THINGS TO DO AFTER TESTING
------------------------------
1. In backend\.env set:

     ALLOW_DEMO_IDENTITY=false

   Until you do, the login screen is decorative: anyone who skips it still
   gets data, because unauthenticated API calls resolve to a demo account.

2. Before this goes anywhere real, close government self-registration in
   backend\.env:

     SELF_REGISTER_ROLES=trainee,employer

FOR YOUR DEMO
-------------
Sign in as a SEEDED employer, not a freshly registered one — a new account has
no postings, applicants or analytics behind it. Set a password on a seeded
account first:

  cd backend
  python scripts\set_password.py --list
  python scripts\set_password.py employer7@example.com
