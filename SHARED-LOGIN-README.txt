KaushalSetu — single sign-in page
=================================

This replaces the per-panel login screens from the previous update with ONE
sign-in page for the whole platform, served by the backend at:

    http://localhost:8000/

Pick Trainee / Employer / Government, sign in, and it forwards you to the
matching panel automatically.

This archive contains only changed and new files (37 of them). It is safe to
apply whether or not you applied the previous auth update.

HOW TO APPLY
------------
1. Stop the backend and all three `npm run dev` terminals.

2. Extract this zip so its `KaushalSetu` folder lands on top of your existing
   one:

     C:\Users\Prakash\Downloads\KaushalSetu-integrated (2)\KaushalSetu

   Choose "Replace the files in the destination".

   Your backend\.env is NOT in this archive, so your database password
   survives untouched.

3. DELETE these three files if they exist (leftovers from the previous
   update — now unused, and confusing to have around):

     frontend\trainee-panel\src\pages\LoginPage.jsx
     frontend\employer-panel\src\pages\LoginPage.jsx
     frontend\gov-portal\src\pages\LoginPage.jsx

4. Restart the backend:

     cd backend
     python -m uvicorn app.main:app --reload --port 8000

5. Restart each panel (no `npm install` needed — no new packages):

     npm run dev

6. Open http://localhost:8000/ and sign in.

HOW THE HANDOFF WORKS
---------------------
The three panels run on three different ports, which means three separate
localStorage scopes — one page cannot store a session for the others. So the
sign-in page forwards you to the right panel with the token in the URL
fragment (#token=...). The panel reads it, saves it, and strips it from the
address bar immediately.

URL fragments are never sent to a server, so the token never lands in an
access log. It does exist briefly in the address bar and in browser history,
which is the honest weak point of this design. The proper fix is putting all
three panels behind one host with a shared session cookie — worth doing
before this is more than a demo, not worth doing for the hackathon.

Which panel you land on is decided by the SERVER, from the role on your
account — not by the button you pressed. Sign in with an employer account
after clicking "Trainee" and it tells you, then takes you to the right place.

TWO THINGS TO DO AFTER TESTING
------------------------------
1. In backend\.env set:

     ALLOW_DEMO_IDENTITY=false

   Until you do, the sign-in page is decorative: direct API calls still
   resolve to a demo account.

2. Before this goes anywhere real, close government self-registration in
   backend\.env:

     SELF_REGISTER_ROLES=trainee,employer

FOR YOUR DEMO
-------------
Sign in as a SEEDED employer, not a freshly registered one — a new account has
no postings, applicants or analytics behind it:

  cd backend
  python scripts\set_password.py --list
  python scripts\set_password.py employer7@example.com

If your panels run on different ports, set these in backend\.env so the
sign-in page forwards correctly:

  TRAINEE_PANEL_URL=http://localhost:5173
  EMPLOYER_PANEL_URL=http://localhost:5174
  GOV_PORTAL_URL=http://localhost:5175
