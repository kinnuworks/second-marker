import Link from "next/link";
import { AppIcon } from "@/components/AppIcon";
import { SiteHeader } from "@/components/SiteHeader";
import { Stamp } from "@/components/Stamp";
import { Reveal } from "@/components/Reveal";
import styles from "./home.module.css";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#stamps", label: "Dispute or skip" },
  { href: "#faq", label: "Questions" },
];

export default function Home() {
  return (
    <>
      <SiteHeader links={NAV}>
        <Link href="/check?sample=1" className="btn btn-candy btn-sm">
          Try the sample
        </Link>
      </SiteHeader>

      <main>
        {/* Hero */}
        <section className={`hero hero--split ${styles.paperHero}`}>
          <div className="container">
            <div>
              <p className={`hand ${styles.kicker}`}>for students deciding whether to ask for a re-mark</p>
              <h1 className={styles.heroTitle}>
                Find the marks your examiner <span className={styles.redpen}>missed</span>.
              </h1>
              <p className="lead">
                Upload your marked paper and its marking scheme. Second Marker checks every answer step by step and tells
                you which questions are worth sending back for a re-mark.
              </p>
              <div className="cta-row">
                <Link href="/check?sample=1" className="btn btn-candy btn-lg">
                  Try the sample answer book
                </Link>
                <Link href="/check" className="btn btn-outline btn-lg">
                  Check my answer book
                </Link>
              </div>
              <div className="trust">
                <span>Free</span>
                <span>No account</span>
                <span>Your pages aren&rsquo;t stored</span>
              </div>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* Facts */}
        <section className={`section ${styles.factsBand}`} aria-label="How re-evaluation works">
          <div className="container">
            <div className={styles.facts}>
              <Fact big="fee" small="many boards charge for a re-mark, per question or per paper" />
              <Fact big="days" small="is often all the time you get to ask" />
              <Fact big="↓" small="a second look can lower your marks too" red />
              <Fact big="28,000+" small="re-mark and re-count requests to one board, CBSE, in 2025" />
            </div>
            <p className={styles.factNote}>
              The usual advice is to have a teacher look over your paper before you ask. Few teachers have time to go through
              twenty pages in the few days the window is open.
            </p>
          </div>
        </section>

        {/* Problem → solution */}
        <section className="section section--alt">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">The decision</span>
              <h2>
                Which questions are worth sending back? <span className="t-muted">Now you can tell.</span>
              </h2>
            </div>
            <div className="grid grid-2">
              <div className="card card--flat">
                <p className="t-title">On your own</p>
                <ul className={styles.list}>
                  <li>Twenty pages of your paper and a marking scheme, side by side</li>
                  <li>Adding up the margin marks by hand to check the cover</li>
                  <li>Guessing which answers the examiner rushed</li>
                  <li>Paying for questions that come back the same, or lower</li>
                </ul>
              </div>
              <div className={`card card--chosen ${styles.chosen}`}>
                <p className="t-title">With Second Marker</p>
                <ul className={`${styles.list} ${styles.listGood}`}>
                  <li>Every margin mark read and re-added against the cover total</li>
                  <li>Each answer lined up with the scheme&rsquo;s step marks, with your own line quoted</li>
                  <li>A DISPUTE or SKIP stamp on every question, with the fee and the risk</li>
                  <li>A printed filing sheet listing exactly what to apply for</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Deep dives */}
        <section id="how" className="section">
          <div className="container stack">
            <Reveal className="split">
              <div>
                <span className="eyebrow"><span className="dot" /> Step 1</span>
                <h3>It reads your answer book, red ink included.</h3>
                <p className="lead">
                  Your working is copied down line by line, and every mark the examiner wrote is read, including the total on
                  the cover. If the margin marks don&rsquo;t add up to that total, you&rsquo;ll see it before anything else.
                </p>
                <div className="chips">
                  <span className="chip">PDF or phone photos</span>
                  <span className="chip">Half marks</span>
                  <span className="chip">Says when it can&rsquo;t read a page</span>
                </div>
              </div>
              <div className="stage stage--soft">
                <TotalsMock />
              </div>
            </Reveal>

            <Reveal className="split split--flip">
              <div>
                <span className="eyebrow"><span className="dot" /> Step 2</span>
                <h3>Each answer meets the official scheme.</h3>
                <p className="lead">
                  Marking schemes and rubrics give marks for steps. Every step is marked credited, written but not
                  credited, or not written, and your own line is quoted next to it.
                </p>
                <div className="chips">
                  <span className="chip">Tested on CBSE Class 12 Maths</span>
                  <span className="chip">Paste your own rubric (beta)</span>
                  <span className="chip">Different methods flagged</span>
                </div>
              </div>
              <div className="stage stage--soft">
                <StepsMock />
              </div>
            </Reveal>

            <Reveal className="split" >
              <div id="stamps">
                <span className="eyebrow"><span className="dot" /> Step 3</span>
                <h3>Plain arithmetic decides what to dispute.</h3>
                <p className="lead">
                  The possible gain, any fee or question limit, and the risk of losing marks are worked out by ordinary code you
                  can read. If the examiner was already generous, it tells you to leave that question alone.
                </p>
                <div className={styles.stampPair}>
                  <div>
                    <Stamp kind="DISPUTE" size="md" />
                    <p className="t-small">Steps from the scheme are on your page but weren&rsquo;t given marks.</p>
                  </div>
                  <div>
                    <Stamp kind="SKIP" size="md" />
                    <p className="t-small">The marks match your working, or a second look could cost you.</p>
                  </div>
                </div>
              </div>
              <div className="stage stage--soft">
                <LedgerMock />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Limits + FAQ */}
        <section id="faq" className="section section--alt">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Questions</span>
              <h2>What it does, and what it won&rsquo;t.</h2>
            </div>
            <div className="faq">
              <details>
                <summary>Does it file the application for me?</summary>
                <p>No. You ask your exam board, school or university yourself. Second Marker gives you a sheet with the questions and the scheme steps to cite.</p>
              </details>
              <details>
                <summary>Can it promise my marks will go up?</summary>
                <p>No. The stamps are signals, not verdicts: they point at evidence on your own page and say how sure the reader was. Your examiners decide, and a re-mark can go either way.</p>
              </details>
              <details>
                <summary>Which exams does it work with?</summary>
                <p>It has been tested on one paper: CBSE Class 12 Mathematics 2025–26, with its official marking scheme typed in and checked by hand. For other exams you can paste your own marking scheme, rubric or answer key; that path is newer and less tested, so check its readings against your page.</p>
              </details>
              <details>
                <summary>What if my handwriting is hard to read?</summary>
                <p>It marks that question or page as unreadable and won&rsquo;t stamp it DISPUTE. You&rsquo;ll be asked to check it yourself.</p>
              </details>
              <details>
                <summary>What happens to my pages?</summary>
                <p>They&rsquo;re turned into pictures on your device and sent to be read once. Nothing is saved, and closing the tab clears the results.</p>
              </details>
              <details>
                <summary>Should I still ask a teacher?</summary>
                <p>If you can, yes. Take the sheet with you: it points to the exact lines and scheme steps, so a teacher can check in a few minutes.</p>
              </details>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={`section ${styles.final}`}>
          <div className="container">
            <AppIcon size={88} className={styles.finalIcon} />
            <h2>
              Know before you pay. <span className="t-muted">It takes a few minutes.</span>
            </h2>
            <div className="cta-row">
              <Link href="/check?sample=1" className="btn btn-candy btn-lg">
                Try the sample answer book
              </Link>
              <Link href="/check" className="btn btn-outline btn-lg">
                Check my answer book
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <AppIcon size={22} /> Second Marker. Not affiliated with any exam board.
          </span>
          <span>
            Sources: <a href="https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/Maths-MS.pdf">marking scheme</a>,{" "}
            <a href="https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/Maths-SQP.pdf">sample paper</a>,{" "}
            <a href="https://www.pw.live/news/cbse-class-12-re-evaluation-2026">fees and process</a>,{" "}
            <a href="https://news.careers360.com/cbse-class-12-revaluation-verification-results-2025-out-at-results-cbse-nic-in/amp">28,000+ requests in 2025</a>
          </span>
          <span>
            Planned with the <a href="https://github.com/challengepost/learn-ai-basics">Devpost Learn skill pack</a>
          </span>
        </div>
      </footer>
    </>
  );
}

function Fact({ big, small, red }: { big: string; small: string; red?: boolean }) {
  return (
    <div className={styles.fact}>
      <strong className="hand" style={red ? { color: "var(--red)" } : undefined}>{big}</strong>
      <span>{small}</span>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className={`stage ${styles.heroStage}`}>
      <div className="window">
        <div className="window__bar">
          <div className="lights" aria-hidden="true"><i /><i /><i /></div>
          <span className="window__title">Question 27 · 3 marks</span>
        </div>
        <div className={styles.heroBody}>
          <div className={styles.heroCrop}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sample/pages/page-4.jpg" alt="Question 27 in a marked answer book: the full proof, marked 1½ out of 3 in red" />
          </div>
          <div className={styles.heroSteps} aria-hidden="true">
            <div className={styles.s1}><b>½</b> V and S written <em>credited</em></div>
            <div className={styles.s1}><b>½</b> dV/dt = −kS <em>credited</em></div>
            <div className={styles.s2}><b>1</b> 4πr² dr/dt <em>not credited</em></div>
            <div className={styles.s1}><b>½</b> −kS = S dr/dt <em>credited</em></div>
            <div className={styles.s2}><b>½</b> dr/dt = −k <em>not credited</em></div>
          </div>
        </div>
      </div>
      <div className={`float ${styles.float1}`}>
        <div className={styles.floatRow}>
          <span className="t-micro">Cover says</span>
          <span className="hand" style={{ color: "var(--red)", fontSize: 26, lineHeight: 1 }}>12</span>
          <span className="t-micro">marks inside</span>
          <span className="hand" style={{ color: "var(--green)", fontSize: 26, lineHeight: 1 }}>13</span>
        </div>
      </div>
      <div className={`float ${styles.float2}`}>
        <Stamp kind="DISPUTE" size="md" />
        <span className={`hand ${styles.gain}`}>+1½ possible</span>
      </div>
    </div>
  );
}

function TotalsMock() {
  return (
    <div className="window" aria-hidden="true">
      <div className="window__bar">
        <div className="lights"><i /><i /><i /></div>
        <span className="window__title">Totals check</span>
      </div>
      <div className={styles.mockPad}>
        <div className={styles.totals}>
          <div><span className="t-micro">Cover total</span><b className="hand" style={{ color: "var(--red)" }}>12</b></div>
          <span className={styles.neq}>≠</span>
          <div><span className="t-micro">Marks inside</span><b className="hand" style={{ color: "var(--green)" }}>13</b></div>
        </div>
        <p className={styles.mockMsg}><strong>The total doesn&rsquo;t add up.</strong> Apply for verification first: it&rsquo;s cheaper, and it exists for this.</p>
      </div>
    </div>
  );
}

function StepsMock() {
  return (
    <div className="window" aria-hidden="true">
      <div className="window__bar">
        <div className="lights"><i /><i /><i /></div>
        <span className="window__title">Question 24 · 2 marks</span>
      </div>
      <div className={styles.mockPad}>
        <div className={`${styles.step} ${styles.stepOk}`}><b>½</b><span>f(0) = 1<small>on the page: f(5) = f(0) f(5) ⇒ f(0) = 1</small></span><em>Credited</em></div>
        <div className={`${styles.step} ${styles.stepOk}`}><b>1</b><span>Set up the limit<small>on the page: = lim [2 f(h) − 2]/h</small></span><em>Credited</em></div>
        <div className={`${styles.step} ${styles.stepMiss}`}><b>½</b><span>= 2 f′(0) = 6<small>on the page: = 2 f′(0) = 2 × 3</small></span><em className="hand">+½</em></div>
      </div>
    </div>
  );
}

function LedgerMock() {
  const rows = [
    { q: "Q27", m: "1½/3", g: "+1½", s: "DISPUTE" as const },
    { q: "Q24", m: "1½/2", g: "+½", s: "DISPUTE" as const },
    { q: "Q31", m: "2/3", g: "", s: "SKIP" as const },
  ];
  return (
    <div className="window" aria-hidden="true">
      <div className="window__bar">
        <div className="lights"><i /><i /><i /></div>
        <span className="window__title">What to dispute</span>
      </div>
      <div className={styles.mockPad}>
        {rows.map((r) => (
          <div key={r.q} className={styles.lrow}>
            <span className={styles.lq}>{r.q}</span>
            <span className="hand" style={{ color: "var(--red)", fontSize: 20 }}>{r.m}</span>
            <span className="hand" style={{ color: "var(--green)", fontSize: 20, fontWeight: 700 }}>{r.g}</span>
            <Stamp kind={r.s} size="sm" />
          </div>
        ))}
        <div className={styles.lfoot}><span>2 questions</span><b className="t-mono">₹200</b><span className="hand" style={{ color: "var(--green)", fontSize: 22 }}>+2</span></div>
        <p className="t-micro">Q31: the examiner gave more than the working supports. A second look could lower it.</p>
      </div>
    </div>
  );
}
