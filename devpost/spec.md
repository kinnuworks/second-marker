---
doc: spec
status: approved
---

<!-- How this plan was made: agent recommendations, shown to the learner for approval. The learner asked the agent to make the technical choices. -->

# Second Marker — Technical Spec

## How This Works, In Plain Language
Second Marker is a website with a small server behind it.

- **The website** shows the answer book, the question-by-question comparison and the ledger. If you upload a PDF, the website turns its pages into pictures on your own device first.
- **The reader** (on the server) sends one page picture at a time to an AI vision model and asks it to write down, for each question on that page, what the student wrote and what mark the examiner put in the margin. It must say "can't read" rather than guess.
- **The checker** (on the server) gives the AI one question at a time: the student's working, and the official marking scheme's steps for that question. The AI says, for each step, whether the student wrote it, quoting their line.
- **The arithmetic and the decision are ordinary code, not AI.** Re-adding marks, working out possible gains, fees, the 10-question cap and the DISPUTE/SKIP stamps all happen in plain, tested code, so the money advice is predictable and checkable.
- **The marking scheme** is a file in the project, typed in from the board's official PDF, with a link to the source.
- **The sample** is a real set of answer-book page pictures plus the saved result of running the same reader and checker on them, so it opens instantly and identically every time.

Why this shape: the AI does only what needs eyes and judgment (reading handwriting, matching a step). Everything a student's money depends on is plain code that can be tested.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.
1. Student opens `/` → static front page.
2. **Try the sample** → `/check?sample=1` loads `public/sample/result.json` and page images; no server call.
3. **Check my answer book** → `/check` → student drops files → PDF pages are rendered to JPEG in the browser (pdf.js); photos are shrunk to ~1600 px on the long edge.
4. For each page, the browser calls `POST /api/read-page` with the image → the reader returns questions found on that page (number, top/bottom position on the page, transcribed lines, examiner mark, legibility) and the cover total if it's the cover. Progress lines update as each page returns.
5. The browser merges pages into one answer book (a question can span pages).
6. For each question, the browser calls `POST /api/check-question` with the transcribed working and the question number → the server adds that question's scheme steps → the checker returns a verdict per step with a quoted line and confidence.
7. `lib/totals.ts` and `lib/ledger.ts` run in the browser on the merged result → totals banner, gains, stamps, fee total.
8. Student ticks/unticks → ledger recomputes → **Filing sheet** → `/check/sheet` renders a print layout from the same state.

## Stack
- **Next.js 15 (App Router) + TypeScript + React 19.** One project for the website and the server routes, and it deploys to Vercel with no setup. https://nextjs.org/docs
- **Anthropic TypeScript SDK (`@anthropic-ai/sdk`)**, model **`claude-opus-5-5`**, structured output (`output_config.format` JSON schema), server-side refusal fallback enabled. Chosen for handwriting reading accuracy; the most accurate available reader matters more than cost here. https://docs.claude.com/en/api/messages
- **pdf.js (`pdfjs-dist`)** to render PDF pages to images in the browser, so PDFs never need server-side tools. https://mozilla.github.io/pdf.js/
- **Zod** to validate every AI response against the schema before use. https://zod.dev
- **Plain CSS with custom properties** (no component library), so the answer-book look is designed, not defaulted. Fonts via `next/font/google`.
- **Vitest** for the arithmetic/decision tests and the reader accuracy check. https://vitest.dev
- To verify early in the build: the SDK's exact structured-output call shape and image limits against the current SDK docs.

## Where It Runs and How Someone Tries It
- Local: Node 20+, `npm install`, put `ANTHROPIC_API_KEY` in `.env.local`, `npm run dev`, open http://localhost:3000. The sample works without a key.
- Deployment (agreed): Vercel, from the public GitHub repo. The learner adds `ANTHROPIC_API_KEY` in Vercel project settings and sets a low spend limit in the Anthropic console. Route timeouts raised (`maxDuration`) for page reading.
- Demo recording: the live Vercel URL, starting on the front page, then **Try the sample**.

## Look and Feel
- **Paper:** off-white with pale blue ruled lines and a red margin rule, like the board's answer book. Cover panel with boxed roll-number fields.
- **Inks:** examiner red `#C8102E`; second-marker green `#0B6E4F`; body ink near-black blue `#1B2440`. Nothing purple, no gradients.
- **Type:** Kalam (Indian Type Foundry, handwriting) for margin findings and marks; Hind (Indian Type Foundry, Latin + Devanagari) for UI and body; tabular numerals for totals.
- **Stamps:** DISPUTE (green) and SKIP (grey-blue) as rotated, ink-textured SVG stamps; a short "stamp" animation when the ledger first appears, disabled under reduced motion.
- **Copy:** plain, short, honest. Say "reader" and "checker", not "AI-powered".
- Responsive: question list collapses into a tab bar on phones.

## Components

### Front page
Headline, one-line what/who, sample page image, two buttons, how-it-works strip, honest limits, sources footer.
PRD ref: `prd.md > Screens and Layout`, `prd.md > The Core Journey`.

### Upload and page preparation (`components/Upload.tsx`, `lib/pages.ts`)
Accepts images/PDF, validates type and count, renders PDF pages and resizes images to JPEG in the browser.
PRD ref: `prd.md > Loading an answer book`.

### Reader route (`app/api/read-page/route.ts`, `lib/reader.ts`)
One page image in → structured page reading out. Prompt includes the paper's question list so it can label questions; instructs "write `null` and `legible: false` instead of guessing".
PRD ref: `prd.md > Reading the answer book`.

### Checker route (`app/api/check-question/route.ts`, `lib/checker.ts`)
One question's transcription + its scheme steps in → per-step verdict (`credited` / `written_not_credited` / `not_written` / `alternative_method`), quoted evidence, confidence.
PRD ref: `prd.md > Step-by-step comparison with the marking scheme`.

### Marking scheme (`data/schemes/cbse-xii-maths-2025-26.ts`)
Typed from the official sample paper and marking scheme: each question's number, section, max marks, short prompt, and steps (description + marks). Source URLs recorded in the file.
PRD ref: `prd.md > Step-by-step comparison with the marking scheme`.

### Totals check (`lib/totals.ts`)
Re-adds marks, compares with cover total, flags over-max and unmarked questions, recommends verification first on mismatch. Pure functions, unit-tested.
PRD ref: `prd.md > Totals check`.

### Ledger (`lib/ledger.ts`, `components/Ledger.tsx`)
For each question: possible gain = sum of `written_not_credited` step marks, capped at max minus awarded; confidence from reader + checker; risk note; DISPUTE if gain ≥ ½ and confidence high, otherwise SKIP with reason. Fee per question (default ₹100, editable), cap of 10 questions. Pure functions, unit-tested.
PRD ref: `prd.md > The dispute ledger`.

### Results view (`app/check/page.tsx`, `components/QuestionView.tsx`)
Totals banner, question list, page image cropped to the question's top/bottom position beside the scheme steps with green margin notes, ledger.
PRD ref: `prd.md > Screens and Layout`, `prd.md > The Core Journey`.

### Filing sheet (`app/check/sheet/page.tsx`)
Print-styled A4 sheet of the confirmed questions, the step to cite, and next steps.
PRD ref: `prd.md > Confirm and filing sheet`.

### Sample builder (`scripts/build-sample.ts`)
Runs the real reader and checker on `public/sample/pages/*` and saves `public/sample/result.json`.
PRD ref: `prd.md > Loading an answer book`.

### Reader accuracy check (`scripts/eval-reader.ts`, `eval/`)
Runs the reader on sample pages with hand-written answer keys (true marks, true step verdicts) and reports mark-reading and step-matching accuracy.
PRD ref: `prd.md > Reading the answer book`.

## Data Model
All in memory in the browser; nothing stored on the server.
```ts
Scheme { paper, sourceUrl, questions: { number, section, maxMarks, prompt, steps: { id, text, marks }[] }[] }
PageReading { page, isCover, coverTotal: number|null, questions: { number, top, bottom, lines: string[], examinerMark: number|null, legible: boolean }[] }
QuestionCheck { number, steps: { id, verdict, evidence: string|null, confidence: 'high'|'medium'|'low' }[] }
LedgerRow { number, awarded, max, possibleGain, confidence, stamp: 'DISPUTE'|'SKIP', reason, selected }
```
Leaving the page clears everything.

## File Structure
```
.
├── app/
│   ├── page.tsx                  # front page
│   ├── check/page.tsx            # upload, reading progress, results, ledger
│   ├── check/sheet/page.tsx      # printable filing sheet
│   ├── api/read-page/route.ts    # reader endpoint
│   ├── api/check-question/route.ts # checker endpoint
│   ├── layout.tsx, globals.css   # fonts, paper tokens
├── components/                   # Upload, ReadingProgress, TotalsBanner, QuestionList, QuestionView, Ledger, Stamp
├── lib/
│   ├── reader.ts, checker.ts     # model calls + schemas (server only)
│   ├── totals.ts, ledger.ts      # plain, tested arithmetic and decisions
│   ├── pages.ts                  # PDF/image to JPEG in the browser
│   └── types.ts
├── data/schemes/cbse-xii-maths-2025-26.ts
├── public/sample/                # sample page images + saved result.json
├── scripts/build-sample.ts, scripts/eval-reader.ts
├── eval/                         # answer keys for the accuracy check
├── tests/                        # vitest for totals and ledger
├── reference/                    # official sample paper + marking scheme PDFs
└── devpost/                      # planning docs
```

## External Services and Dependencies
- **Anthropic Messages API** — `POST /v1/messages` via the SDK; model `claude-opus-5-5`; one image + text per reader call, text-only per checker call; JSON-schema structured output; server-side fallback beta on. Key: `ANTHROPIC_API_KEY` (server only). Cost: about 8 pages + ~15 questions per answer book — a few cents to tens of cents per check (verify in build). Docs: https://docs.claude.com/en/api/messages
- **Vercel** hosting, free tier. https://vercel.com/docs
- **Google Fonts** via `next/font` (self-hosted at build).

## Important Failure Modes
- **Handwriting or a mark can't be read** → that question is marked "couldn't read — check yourself" and is never stamped DISPUTE.
- **Model error, timeout or refusal** → that page shows "couldn't read this page"; others continue; a clear message offers the sample.
- **Wrong paper uploaded** → if most questions don't match the scheme, stop with "this looks like a different paper".

## What Was Simplified and Why
- **One paper with an official scheme** instead of every subject — proves the kernel honestly; other papers need schemes rebuilt.
- **Question position as top/bottom of page** instead of exact boxes — enough to show the right part of the page.
- **Saved sample result** instead of a live run for the sample — instant, free and identical for every judge; produced by the real pipeline.
- **No storage, no accounts** — privacy and simplicity.

## Decisions and Open Issues
- Stack, model and deployment: agent recommendations; learner asked the agent to decide. Awaiting approval of this spec.
- Learner uncertainty: none raised (the learner delegated the technical plan). The real technical unknown is how accurately the reader reads handwritten maths and red-ink marks; the reader accuracy check (`scripts/eval-reader.ts`) measures it early, before the rest of the UI is built.
- Open: whether the sample answer book will be handwritten by a person (best) or produced another way (labelled sample either way).
