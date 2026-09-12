KaushalSetu — trainee + employer panels retheming
=================================================

The trainee and employer panels now use the Government Portal's design
language: IBM Plex Sans, the navy / government-blue palette, 4-6px radii,
hairline borders, near-flat cards, and monospaced tabular figures for numbers.

IMPORTANT — this is a RETHEME, not a rewrite. Page layouts, data wiring and
logic are untouched. Nothing that worked before should stop working. That was
deliberate given the presentation timing.

NOTE ON SCOPE
-------------
There is no "training centre" panel in this project — the three panels are
trainee, employer and government. This applies to the TRAINEE and EMPLOYER
panels. If you meant a separate training-provider panel, that doesn't exist.

HOW TO APPLY
------------
1. Stop the backend and all three `npm run dev` terminals.

2. Extract this zip so its `KaushalSetu` folder lands on top of your existing
   one, choosing "Replace the files in the destination":

     C:\Users\Prakash\Downloads\KaushalSetu-integrated (2)\KaushalSetu

   Your backend\.env is NOT in this archive, so your settings survive.

3. If you haven't already, DELETE these three leftovers from an earlier
   update (now unused):

     frontend\trainee-panel\src\pages\LoginPage.jsx
     frontend\employer-panel\src\pages\LoginPage.jsx
     frontend\gov-portal\src\pages\LoginPage.jsx

4. Restart the backend and both panels. No `npm install` needed.

     npm run dev

WHAT CHANGED VISUALLY
---------------------
- Sidebars are now the portal's navy rail (250px, same spacing and active
  state) instead of white.
- Headers are the portal's 60px bar: bold navy title, quiet subtitle beneath.
- Terracotta accent (#C9762C) replaced by government blue (#1E56A0).
- Lexend replaced by IBM Plex Sans throughout, matching the portal.
- Radii tightened (16px -> 8px, 10px -> 6px) for the same institutional feel.
- Numbers in stat tiles now use IBM Plex Mono with tabular figures, so
  columns line up. This is the single biggest reason the portal's tables look
  considered.
- Badges are tighter, with two new tones (caution, alert) matching the
  portal's status palette.
- The shared sign-in page was retheming to match too.

The trainee panel's notification bell and language toggle MOVED from the
sidebar into the top bar — they were designed for a light background and the
rail is now navy.

FONTS AND OFFLINE VENUES
------------------------
IBM Plex loads from Google Fonts. If the venue has no internet the panels fall
back to the system sans stack automatically — everything still works, it just
looks slightly different. If you want to be safe, load the page once on wifi
before you present so the font is cached.

CHECK BEFORE YOU SLEEP
----------------------
Click through every screen you plan to demo. A retheme can't break logic, but
it can make a specific screen look wrong (light text that's now on a dark
background, for example). Ten minutes of clicking now beats finding it at 9am.
