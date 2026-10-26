// Typesets the demo answer book as hand-written pages, then renders them with
// headless Chrome to look like a scanned copy. Everything here is made up for
// the demo: no real student's answer book is used.
//
// Run: node scripts/sample/pages.mjs

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const out = path.resolve("public/sample/pages");
const src = path.resolve("scripts/sample/html");
mkdirSync(out, { recursive: true });
mkdirSync(src, { recursive: true });

const W = 1240; // A4 at 150 dpi
const H = 1754;
const LINE = 46; // ruled line spacing in px

// Deterministic jitter so re-renders match.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const jitter = (n) => (rand() - 0.5) * 2 * n;

/** A line of student handwriting on ruled line `row`, indented `x` px from the margin. */
const w = (row, text, x = 0, size = 34) =>
  `<div class="w" style="top:${row * LINE - 36 + jitter(2)}px;left:${150 + x + jitter(4)}px;font-size:${size + jitter(1.5)}px;transform:rotate(${jitter(0.7)}deg)">${text}</div>`;

/** Question number in the left margin column. */
const qno = (row, n) => `<div class="w qn" style="top:${row * LINE - 36}px;left:38px">${n}</div>`;

/** Examiner's red tick at the end of a line. */
const tick = (row, x) =>
  `<svg class="red" style="left:${x}px;top:${row * LINE - 44}px" width="54" height="44" viewBox="0 0 54 44"><path d="M4 22 C10 28 14 34 18 40 C26 24 36 12 50 4" fill="none" stroke-width="4.5" stroke-linecap="round"/></svg>`;

/** Examiner's cross. */
const cross = (row, x) =>
  `<svg class="red" style="left:${x}px;top:${row * LINE - 42}px" width="40" height="40" viewBox="0 0 40 40"><path d="M6 6 L34 34 M34 6 L8 34" fill="none" stroke-width="4" stroke-linecap="round"/></svg>`;

/** Examiner's circled mark in the right margin. */
/** Examiners write halves as a small stacked fraction. */
const half = (t) => t.replace("½", '<span style="display:inline-flex;flex-direction:column;font-size:55%;line-height:.8;margin-left:2px;transform:translateY(-2px)"><span>1</span><span style="border-top:2px solid #cc1531;padding-top:2px">2</span></span>');

const mark = (row, text) =>
  `<div class="mark" style="top:${row * LINE - 52}px"><span>${half(text)}</span><svg width="96" height="78" viewBox="0 0 96 78"><ellipse cx="48" cy="39" rx="40" ry="30" fill="none" stroke-width="3.5" transform="rotate(-8 48 39)"/></svg></div>`;

const page = (n, body, { cover = false } = {}) => `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Nothing+You+Could+Do&family=Hind:wght@400;600;700&display=block" rel="stylesheet">
<style>
  html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#cfd3d6}
  .scan{position:absolute;inset:0;transform:rotate(${(n % 2 ? 0.35 : -0.3)}deg) translate(${n % 2 ? 4 : -6}px,6px);filter:blur(0.35px) contrast(1.04)}
  .paper{position:absolute;inset:18px 22px 22px 18px;background:#fbfbf6;overflow:hidden;
    ${cover ? "" : `background-image:linear-gradient(90deg,transparent 118px,#e2a2a2 118px,#e2a2a2 120px,transparent 120px),
      linear-gradient(90deg,transparent calc(100% - 132px),#e2a2a2 calc(100% - 132px),#e2a2a2 calc(100% - 130px),transparent calc(100% - 130px)),
      repeating-linear-gradient(180deg,transparent 0,transparent ${LINE - 2}px,#bcd6e6 ${LINE - 2}px,#bcd6e6 ${LINE}px);
      background-position:0 0,0 0,0 96px;`}}
  .paper::after{content:"";position:absolute;inset:0;pointer-events:none;
    background:radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.0),rgba(120,110,90,.08) 80%),url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .4  0 0 0 0 .38  0 0 0 0 .34  0 0 0 .09 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}
  .head{position:absolute;left:0;right:0;top:0;height:96px;border-bottom:2px solid #9bb8c9;font:600 22px Hind,sans-serif;color:#5b6f7c;display:flex;justify-content:space-between;align-items:center;padding:0 40px}
  .body{position:absolute;left:0;right:0;top:96px;bottom:0}
  .w{position:absolute;font-family:Caveat,cursive;font-weight:500;color:#1e2c6e;white-space:nowrap;letter-spacing:.2px}
  .qn{font-weight:600;font-size:38px}
  .red{position:absolute;stroke:#cc1531;opacity:.9}
  .mark{position:absolute;right:20px;width:96px;height:78px;color:#cc1531}
  .mark span{position:absolute;inset:0;display:grid;place-items:center;font:44px "Nothing You Could Do",cursive;transform:rotate(-6deg)}
  .mark svg{position:absolute;inset:0;stroke:#cc1531;opacity:.85}
  sup{font-size:60%}
</style></head>
<body><div class="scan"><div class="paper">${cover ? body : `<div class="head"><span>Q. No.</span><span>Page ${n}</span><span>Marks</span></div><div class="body">${body}</div>`}</div></div></body></html>`;

// ---- Page 1: cover with the examiner's marks table ----
const coverRows = [
  ["Section A (1–20)", "4"], ["24", "1½"], ["25", "2"], ["26", "2"], ["27", "1½"], ["31", "2"],
];
const cover = `
<div style="position:absolute;inset:0;padding:70px 90px;font-family:Hind,sans-serif;color:#26323b">
  <div style="text-align:center;font-weight:700;font-size:40px;letter-spacing:1px">ANSWER BOOK</div>
  <div style="text-align:center;font-size:24px;color:#5b6f7c;margin-top:6px">Senior School Certificate Examination · SAMPLE for demonstration</div>
  <div style="margin-top:60px;display:grid;grid-template-columns:260px 1fr;row-gap:26px;font-size:28px;align-items:center">
    <div>Subject</div><div style="border-bottom:2px solid #9bb8c9;padding-bottom:4px"><span class="w" style="position:static;font-size:40px">Mathematics (041)</span></div>
    <div>Roll No.</div><div style="display:flex;gap:8px">${"SAMPLE01".split("").map((c) => `<span style="width:52px;height:60px;border:2px solid #9bb8c9;display:grid;place-items:center"><span class="w" style="position:static;font-size:40px">${c}</span></span>`).join("")}</div>
    <div>Pages used</div><div><span class="w" style="position:static;font-size:40px">5</span></div>
  </div>
  <div style="margin-top:70px;font-weight:700;font-size:28px">For the examiner's use only</div>
  <table style="margin-top:16px;border-collapse:collapse;width:640px;font-size:26px">
    <tr><th style="border:2px solid #9bb8c9;padding:10px;text-align:left">Question</th><th style="border:2px solid #9bb8c9;padding:10px;width:200px">Marks</th></tr>
    ${coverRows.map(([q, m]) => `<tr><td style="border:2px solid #9bb8c9;padding:8px 10px">${q}</td><td style="border:2px solid #9bb8c9;padding:2px 10px;text-align:center;color:#cc1531;font:40px 'Nothing You Could Do',cursive">${half(m)}</td></tr>`).join("")}
    <tr><td style="border:2px solid #9bb8c9;padding:10px;font-weight:700">Grand total</td><td style="border:2px solid #9bb8c9;padding:2px 10px;text-align:center;color:#cc1531;font:52px 'Nothing You Could Do',cursive">12</td></tr>
  </table>
  <div style="position:absolute;right:120px;bottom:170px;color:#cc1531;font:34px 'Nothing You Could Do',cursive;transform:rotate(-4deg)">Examiner 1142</div>
</div>`;

// ---- Page 2: Section A answers, Q24 ----
const p2 = [
  qno(1, "1"), w(1, "(B)  sin<sup>-1</sup>(2x)"), tick(1, 470),
  qno(2, "2"), w(2, "(A)  m = q = 3,  n = p = 4"), tick(2, 600),
  qno(3, "3"), w(3, "(C)  −1"), cross(3, 360),
  qno(4, "4"), w(4, "(C)  3I"), tick(4, 330),
  qno(5, "5"), w(5, "(B)  diag (1/3, 1/2, 1/5)"), tick(5, 600),
  mark(5, "4"),
  qno(8, "24"), w(8, "f(x+y) = f(x) f(y)"),
  w(9, "put x = 0, y = 5 :  f(5) = f(0) f(5)  ⇒  f(0) = 1"), tick(9, 860),
  w(10, "f′(5) = lim<sub>h→0</sub>  [ f(5+h) − f(5) ] / h"),
  w(11, "= lim<sub>h→0</sub>  [ f(5) f(h) − f(5) ] / h", 40),
  w(12, "= lim<sub>h→0</sub>  [ 2 f(h) − 2 ] / h", 40), tick(12, 640),
  w(13, "= 2 lim<sub>h→0</sub>  [ f(h) − f(0) ] / h", 40),
  w(14, "= 2 f′(0) = 2 × 3", 40),
  w(15, "∴  f′(5) = 6", 40),
  mark(15, "1½"),
].join("");

// ---- Page 3: Q25, Q26 ----
const p3 = [
  qno(1, "25"), w(1, "OP is the median, so P is mid-point of AB"),
  w(2, "OP = ½ (OA + OB) = ½ (4î + 4k̂) = 2î + 2k̂"), tick(2, 820),
  w(3, "Area of ∥gm = | OA × OP |"),
  w(4, "| î   ĵ   k̂ |", 60), w(5, "| 1   1   1 |", 60), w(6, "| 2   0   2 |", 60), tick(5, 360),
  w(7, "= î(2 − 0) − ĵ(2 − 2) + k̂(0 − 2) = 2î − 2k̂"), tick(7, 830),
  w(8, "Area = √(4 + 4) = 2√2 sq. units"), tick(8, 640),
  mark(8, "2"),
  qno(11, "26"), w(11, "x<sup>y</sup> = e<sup>x − y</sup>.  Taking log :  y log x = (x − y) log e"),
  w(12, "y log x + y = x   ⇒   y = x / (1 + log x)"), tick(12, 720),
  w(13, "dy/dx = [ (1 + log x)·1 − x·(1/x) ] / (1 + log x)<sup>2</sup>"),
  w(14, "= log x / (1 + log x)<sup>2</sup> = log x / ( log (xe) )<sup>2</sup>"), tick(14, 800),
  w(15, "at x = e :  dy/dx = log e / (log e<sup>2</sup>)<sup>2</sup> = 1/2"), cross(15, 760),
  mark(15, "2"),
].join("");

// ---- Page 4: Q27 (examiner stopped ticking halfway) ----
const p4 = [
  qno(1, "27"), w(1, "Let r = radius of the ice ball at time t."),
  w(2, "V = (4/3) π r<sup>3</sup>   ...(1)        S = 4 π r<sup>2</sup>   ...(2)"), tick(2, 900),
  w(3, "dV/dt ∝ S   ⇒   dV/dt = −k S ,  k > 0   ...(3)"), tick(3, 830),
  w(4, "Differentiating (1) w.r.t. t :"),
  w(5, "dV/dt = (4/3) π · 3r<sup>2</sup> · dr/dt = 4 π r<sup>2</sup> dr/dt   ...(4)"),
  w(6, "From (3) and (4) :   − k S = 4 π r<sup>2</sup> dr/dt"),
  w(7, "− k S = S · dr/dt          (using (2))", 40),
  w(8, "⇒  dr/dt = − k", 40),
  w(9, "∴ the radius decreases at a constant rate k."),
  mark(9, "1½"),
].join("");

// ---- Page 5: Q31 (an arithmetic slip, marked generously) ----
const p5 = [
  qno(1, "31"), w(1, "Let A : Mehul selected,  B : Rashi selected  (independent)"),
  w(2, "P(A) = 0.4 ,  P(A ∩ B′) + P(A′ ∩ B) = 0.5"), tick(2, 760),
  w(3, "Let P(B) = x"),
  w(4, "0.4 (1 − x) + 0.6 x = 0.5"),
  w(5, "0.4 − 0.4x + 0.6x = 0.5   ⇒   0.2 x = 0.04"),
  w(6, "x = 0.2   ∴  P(Rashi) = 0.2"), tick(6, 560),
  w(7, "P(at least one) = 1 − P(A′) P(B′)"),
  w(8, "= 1 − 0.6 × 0.8 = 0.52"), tick(8, 470),
  mark(8, "2"),
].join("");

const pages = [
  page(1, cover, { cover: true }),
  page(2, p2), page(3, p3), page(4, p4), page(5, p5),
];

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
pages.forEach((html, i) => {
  const file = path.join(src, `page-${i + 1}.html`);
  writeFileSync(file, html);
  const png = path.join(out, `page-${i + 1}.png`);
  execFileSync(chrome, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    `--window-size=${W},${H}`, "--virtual-time-budget=4000", `--screenshot=${png}`, `file://${file}`,
  ], { stdio: "ignore" });
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82", png, "--out", png.replace(".png", ".jpg")], { stdio: "ignore" });
  console.log("rendered", path.relative(process.cwd(), png.replace(".png", ".jpg")));
});
