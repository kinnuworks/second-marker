---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast (the learner asked the agent to build; hands-on checkpoints still apply)

## Slices

- [x] **1. A real ledger from the official marking scheme**
  Becomes usable: A running site whose results page shows a DISPUTE/SKIP ledger, totals check and fee total, computed by tested code from the official Class 12 Maths scheme and a hand-made example answer book.
  Why now: The decision is the kernel. Building it first, as plain tested code, means everything later only has to feed it correct readings.
  PRD ref: `prd.md > Totals check`, `prd.md > The dispute ledger`
  Spec ref: `spec.md > Marking scheme`, `spec.md > Totals check`, `spec.md > Ledger`, `spec.md > File Structure`
  Build: Scaffold Next.js + TypeScript per the file structure; type the scheme from the official PDF with source links; write `lib/totals.ts` and `lib/ledger.ts` with Vitest tests; render a bare ledger at `/check?fixture=1`.
  Verify (mechanical): `npm test` passes (totals, gains, cap, stamps); `npm run build` succeeds; the fixture page renders the expected stamps.
  Learner check: Open `/check?fixture=1` and read the ledger: do the DISPUTE/SKIP calls and reasons make sense?
  Commit: `Add marking scheme, totals check and dispute ledger`

- [ ] **2. The reader and checker work on a real answer-book page**
  Becomes usable: Sample answer-book pages exist, and a script reads them with the AI reader and checker, then reports how accurately it read the marks and matched the steps.
  Why now: Reading handwriting and red ink is the biggest unknown. Measuring it before building the interface means bad news arrives early.
  PRD ref: `prd.md > Reading the answer book`, `prd.md > Step-by-step comparison with the marking scheme`
  Spec ref: `spec.md > Reader route`, `spec.md > Checker route`, `spec.md > Reader accuracy check`, `spec.md > Sample builder`
  Build: Produce labelled sample answer-book pages with known true marks; write `lib/reader.ts`, `lib/checker.ts` and the two API routes with Zod validation; write `scripts/eval-reader.ts` and `scripts/build-sample.ts`; save `public/sample/result.json`.
  Verify (mechanical): `npm run eval` prints mark-reading and step-matching accuracy against the answer keys; the saved sample result validates against the schema.
  Learner check: Look at a sample page next to what the reader wrote down: did it read the marks right?
  Commit: `Add answer-book reader, step checker and accuracy check`

- [ ] **3. Check an answer book end to end**
  Becomes usable: On `/check`, you can open the sample or upload photos/PDF, watch each page being read, see the totals banner, open each question side by side with the scheme steps, and tick the questions to dispute.
  Why now: Connects the kernel (slice 1) to real readings (slice 2) through the core journey.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Loading an answer book`, `prd.md > Screens and Layout`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Upload and page preparation`, `spec.md > Results view`, `spec.md > Look and Feel`
  Build: Upload with PDF rendering and resizing; reading progress; merged results; question view with page crop and green margin notes; ledger with confirm; unreadable, wrong-paper, nothing-to-dispute and error states; answer-book styling.
  Verify (mechanical): `npm run build` passes; in the browser, the sample flow renders all questions and stamps; an uploaded sample page is read live and appears in the list; error state shown when the API fails.
  Learner check: Click **Try the sample answer book**, open Question 27, and say whether the side-by-side view makes the missed mark obvious.
  Commit: `Add end-to-end answer book check`

- [ ] **4. Front page, filing sheet and live deployment**
  Becomes usable: A public link where the first screen says what it does and who it's for, the sample is one click away, and confirmed picks print as a filing sheet.
  Why now: Finishes the journey and makes it reachable by judges without cloning.
  PRD ref: `prd.md > The Core Journey` (steps 1 and 8), `prd.md > Confirm and filing sheet`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Front page`, `spec.md > Filing sheet`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Front page, stamps animation, filing sheet with print CSS, README, license, deploy to Vercel.
  Verify (mechanical): `npm run build` and `npm test` pass; the deployed URL loads the front page, the sample, and the sheet; print preview fits A4.
  Learner check: Open the live link on your phone, try the sample, and print the filing sheet.
  Commit: `Add front page, filing sheet and deployment`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 3 (the full check works on the sample)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions
- Next.js 16 instead of 15 — the current release when the build started; Cache Components left off because the app is mostly client-side.
- The checker reports which scheme steps are on the page, and plain code (`lib/allocate.ts`) decides which of them the examiner's single mark already covers — examiners write one mark per question, not one per step, so "credited" can't be read off the page.
