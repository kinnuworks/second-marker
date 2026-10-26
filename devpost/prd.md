---
doc: prd
status: approved
---

<!-- How this plan was made: agent proposals, shown to the learner for approval. Not a transcript of a learner interview. -->

# Second Marker — Product Requirements

For a Class 12 CBSE student holding the scanned copy of their marked Maths answer book: it finds marks the examiner missed and tells them which questions are worth paying to re-evaluate.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
1. **Arrive.** The first screen says what it does and who it's for in one line, shows a marked answer-book page, and offers two buttons: **Try the sample answer book** and **Check my answer book**. No sign-up. (`scope.md > What "Working" Looks Like`)
2. **Load.** Sample: loads instantly. Own: the student drops photos or a PDF of the scanned copy; the paper is fixed to *CBSE Class 12 Mathematics, 2025–26 sample paper* for this proof of concept, and the screen says so.
3. **Read.** A progress view shows each page being read: "Reading page 3 of 8… found Questions 24 and 25… examiner marked 1½ and 2."
4. **Totals check.** A banner reports whether the margin marks add up to the total on the cover. If they don't, it says so first, because the cheaper *verification* step fixes totalling errors.
5. **Question by question.** A list of every question with marks awarded vs. maximum. Opening one shows the student's page on the left and the official scheme's steps on the right, each step tagged **credited**, **written but not credited**, or **not written**, with the student's own line quoted as evidence.
6. **The ledger.** Every question gets a stamp: **DISPUTE** or **SKIP**, with the likely marks to gain, the fee, and a plain risk note ("re-evaluation can lower marks; this one is low risk because…"). The total fee and the 10-question cap are shown.
7. **Confirm.** The student ticks or unticks each DISPUTE. Nothing is final until they confirm.
8. **Filing sheet.** A printable one-page sheet: question numbers, the scheme step to cite for each, and what to do next on the board's portal. Success = the student knows exactly which questions to file and why.

## Screens and Layout
- **Front page** — headline, one-line explanation, sample page image, two buttons, a short "how it works" strip, honest limits, footer with sources.
- **Upload** — drop zone, the fixed paper name, privacy note (pages are processed, not stored), a "Use the sample instead" link.
- **Reading** — page thumbnails with live progress lines.
- **Results** — top: totals banner. Left column: question list with marks. Main area: the open question (page image | scheme steps). Right or bottom on mobile: the ledger.
- **Filing sheet** — print-friendly page.

## Look and Feel
- The answer book is the interface: pale ruled paper, a cover with roll-number boxes, margins.
- Two inks: the examiner's **red** (what was awarded) and the **second marker's green** (what the app found). Findings are written in a handwriting-style face, as if in the margin.
- Rubber-stamp verdicts: DISPUTE and SKIP, slightly rotated, ink-textured.
- Body text in a clear Indian-designed sans with Devanagari support, so Hindi can come later.
- Calm, exact, plain words. No "AI-powered", no sparkles, no purple gradients, no warm-beige serif look.
- Works on a phone (students will use phones), great on a laptop for the demo.

## Features and Behavior

### Loading an answer book
- As a student, I want to try it without my own scan, so I can see what it does first.
  - [ ] **Try the sample answer book** shows results in under 2 seconds, with no upload.
  - [ ] The sample is labelled as a sample everywhere it appears.
- As a student, I want to load my own scanned copy.
  - [ ] Accepts JPG/PNG photos (several at once) and PDF.
  - [ ] Rejects other files with a clear message; warns if more than 30 pages.
  - [ ] Shows that this proof of concept supports only the Class 12 Maths 2025–26 sample paper.

### Reading the answer book
- [ ] Each page shows a progress line while it is read.
- [ ] For each question it records: question number, page, the student's working (transcribed), and the examiner's mark.
- [ ] Unreadable marks or working are flagged "couldn't read — check this yourself", never guessed.

### Totals check
- [ ] Re-adds every question's mark and compares with the cover total.
- [ ] Flags a mismatch, a mark above the question's maximum, and a question with no mark at all.
- [ ] A mismatch recommends verification (cheaper) before re-evaluation.

### Step-by-step comparison with the marking scheme
- [ ] Every question lists the official scheme's steps and their marks (½, 1, …).
- [ ] Each step is tagged credited / written but not credited / not written, with the student's line quoted.
- [ ] "Written but not credited" adds up to the question's possible gain.
- [ ] Alternative correct methods are noted as "different method — scheme allows full marks for correct alternatives" rather than marked missing.

### The dispute ledger
- [ ] Each question gets DISPUTE or SKIP with a one-line reason.
- [ ] Shows likely gain, fee per question (default ₹100, editable), total fee, and the 10-question cap.
- [ ] Shows a risk note for each DISPUTE; low-confidence readings are never stamped DISPUTE without a warning.
- [ ] Nothing is presented as a guaranteed result.

### Confirm and filing sheet
- [ ] The student can untick/tick each question; totals update.
- [ ] The filing sheet lists chosen questions, the scheme step to cite, and next steps; it prints cleanly on A4.

## States and Boundaries
- **First use** — front page explains what and who before any action.
- **Reading** — progress per page; can't start a second check mid-read.
- **Unreadable page** — that page is marked unreadable; the rest still works.
- **Wrong paper** — if the questions don't match the supported paper, it says so and stops.
- **Nothing to dispute** — a calm "the marking looks right; save your money" result.
- **Service error** — plain message plus "try the sample" so the visit is never a dead end.
- **Persistence** — none. Closing the tab clears everything; pages aren't stored.

## Product Decisions
- One paper only (Class 12 Maths 2025–26 sample paper, official scheme) — proves the kernel honestly; real papers need schemes rebuilt, which is later. *(Agent proposal, pending learner approval.)*
- Sample answer book as the default path — judges and first-time students see value without uploading. *(Agent proposal.)*
- Decision, not just analysis — the ledger with fee and risk is the product. *(Agent proposal.)*
- No personal story in the product or pitch. *(Learner's statement.)*

## What We're Building
Front page, sample answer book, upload (photos/PDF), page reading with progress, totals check, step-by-step comparison, dispute ledger with confirm, printable filing sheet, error and empty states.

## Deferred From the POC
- Other subjects and real board papers — each needs its scheme rebuilt and labelled.
- Hindi interface.
- Saving results — would need accounts or storage.
- "Is this my answer book?" handwriting check.

## Possible Later Enhancements
Class 10 and state boards; university revaluation; a teacher mode to review a class's photocopies.

## Non-Goals
- Filing on the board's portal — needs the student's login.
- Promising a score — re-evaluation is the board's decision.
- Grading unmarked practice papers — other tools do that.

## Open Questions
- Sample answer book: a real hand-written sample (best) or a generated one? Can wait for the build; generated by default.
