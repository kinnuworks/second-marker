# Second Marker

Find the marks your examiner missed.

After CBSE board results, a Class 12 student can buy the scanned copy of their marked answer book and then pay ₹100 per question for re-evaluation, up to 10 questions per subject, inside a window of a few days. A second look can lower marks as well as raise them, so the hard part is knowing which questions to pay for.

Second Marker reads the scanned copy, re-adds every mark the examiner wrote, and lines each answer up against the board's official marking scheme step by step. Each question is stamped DISPUTE or SKIP with the possible gain, the fee and the risk, and the confirmed picks print as a filing sheet.

**Try it:** https://second-marker.vercel.app (the sample answer book opens in one click, no account)

## How it works

1. **Reader** (`lib/reader.ts`). Each page image goes to a vision model, which writes down the student's working line by line and the examiner's red-ink mark for each question. It returns `null` for anything it can't read.
2. **Checker** (`lib/checker.ts`). For each question, the model reports which of the scheme's mark-bearing steps are on the page, quoting the student's own line.
3. **Plain code decides the rest.** Examiners write one mark per question, so `lib/allocate.ts` works out which written steps that mark already covers. `lib/totals.ts` re-adds the marks against the cover total. `lib/ledger.ts` computes gains, fees, the 10-question cap and the risk, and stamps each question. All of this is unit-tested (`tests/`).

The marking scheme (`data/schemes/cbse-xii-maths-2025-26.ts`) was typed in from the official CBSE Class XII Mathematics 2025–26 [sample paper](https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/Maths-SQP.pdf) and [marking scheme](https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/Maths-MS.pdf). It is the only paper supported so far.

## The sample answer book

`public/sample/pages` is a five-page answer book written for this demo (no real student's work). `scripts/sample/pages.mjs` typesets it in handwriting fonts and renders it with headless Chrome. It is built to show each kind of result: a cover total that doesn't match the marks inside, steps written but not credited, an answer marked more generously than the working supports, and fairly marked answers. The true values are in `eval/sample-key.json`.

## Run it

```bash
npm install
cp .env.example .env.local   # add your Anthropic API key
npm run dev                  # http://localhost:3000
npm test                     # totals, allocation and ledger tests
npm run eval                 # reader + checker accuracy against eval/sample-key.json
npm run sample               # re-create public/sample/result.json with the real reader
```

The sample works without a key. Uploads need `ANTHROPIC_API_KEY`.

## Planning

This project was planned and built with the [Devpost Learn skill pack](https://github.com/challengepost/learn-ai-basics) for Build With AI: Basics. The planning documents are in [`devpost/`](devpost): [scope](devpost/scope.md), [PRD](devpost/prd.md), [spec](devpost/spec.md) and the [build checklist](devpost/checklist.md).

## Limits

- It doesn't file anything. Students apply on the board's website.
- It gives evidence and odds, never a promised result.
- One paper so far. Each subject needs its marking scheme typed in and checked.

Not affiliated with CBSE. MIT licensed.
