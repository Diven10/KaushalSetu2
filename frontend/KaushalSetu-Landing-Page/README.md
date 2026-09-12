# KaushalSetu — Landing Page

Run:
```bash
npm install
npm run dev
```

## Structure

The page is now a funnel with a deliberate fork in it:

1. **Hero** — one promise, no audience split yet
2. **The Gap** — the problem both audiences share
3. **Meet KaushalSetu** — what the platform is
4. **Two perspectives** ← *the fork.* Two cards, each with the question that
   audience is actually asking. "Learn more" scrolls to their section.
5. **For trainees** — five USPs, the Career Digital Twin visual, and trainee
   sign-in / registration
6. **For training centres** — five USPs, the learner-paths visual, and centre
   sign-in / registration
7. **How it works → Scale → Final CTA** — the final CTA offers one door per
   audience rather than a single ambiguous button

Everything that used to sit between "Meet KaushalSetu" and "Two perspectives"
(the mixed Career Twin / skill map / journey / training-intelligence /
why sections) is gone. That was the part that blurred the two audiences.

## Sign-in wiring

The landing page does not implement auth. It links to the platform's shared
sign-in page, which is served by the API:

```
http://localhost:8000/?from=trainee
http://localhost:8000/?from=trainee&register=1
http://localhost:8000/?from=employer
http://localhost:8000/?from=employer&register=1
```

`from` preselects the role and `register=1` opens the Create-account tab, so a
visitor who picked a side here doesn't have to pick again there.

Change where that points with the `signInBase` prop in `src/main.jsx` — set it
to your deployed API origin when you move off localhost.

Note: the training centre uses the `employer` role internally, because that is
what the database and API call it. Only the label changed.

## Notes

- No new dependencies. Still React + Vite, no UI library, no animation library.
- No colours or fonts were changed — the existing palette and type scale are
  used throughout.
- The logo is at `src/assets/kaushalsetu-logo.png` (cropped to a transparent
  circle) and the favicon at `public/favicon.png`.
