import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Stamp } from "@/components/Stamp";
import styles from "./home.module.css";

export default function Home() {
  return (
    <>
      <SiteHeader>
        <Link href="/check" className="btn btn--ghost">
          Check my answer book
        </Link>
      </SiteHeader>

      <main>
        <section className={`wrap ${styles.hero}`}>
          <div className={styles.copy}>
            <p className={styles.kicker}>For CBSE Class 12 students, the week after results</p>
            <h1>
              Find the marks your examiner <span className={styles.missed}>missed</span>.
            </h1>
            <p className={styles.lede}>
              Upload the scanned copy of your marked answer book. Second Marker re-adds every mark, checks each answer
              against the board&rsquo;s official marking scheme, step by step, and tells you which questions are worth
              paying to re-evaluate.
            </p>
            <div className={styles.ctas}>
              <Link href="/check?sample=1" className="btn btn--green">
                Try the sample answer book
              </Link>
              <Link href="/check" className="btn btn--ghost">
                Check my answer book
              </Link>
            </div>
            <p className={styles.fine}>Free · no sign-up · your pages aren&rsquo;t stored</p>
          </div>

          <figure className={styles.demo} aria-label="Example: question 27 of a marked answer book with a missed step">
            <div className={styles.page}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sample/pages/page-4.jpg" alt="A handwritten answer to question 27, marked 1½ out of 3 in red ink" />
              <span className={`${styles.margin} hand`}>
                last 2 steps
                <br />
                not credited
              </span>
              <span className={`${styles.plus} hand`}>+1½</span>
            </div>
            <div className={styles.stamp}>
              <Stamp kind="DISPUTE" size="lg" />
            </div>
            <figcaption className={styles.caption}>
              Q27 · given <span className="hand" style={{ color: "var(--red)" }}>1½</span>/3 · the full proof is on the page
            </figcaption>
          </figure>
        </section>

        <section className={styles.facts} aria-label="Why this matters">
          <div className={`wrap ${styles.factGrid}`}>
            <div>
              <strong className="hand">₹100</strong>
              <span>per question to re-evaluate</span>
            </div>
            <div>
              <strong className="hand">10</strong>
              <span>questions at most, per subject</span>
            </div>
            <div>
              <strong className="hand">a few days</strong>
              <span>to decide and apply</span>
            </div>
            <div>
              <strong className="hand" style={{ color: "var(--red)" }}>↓</strong>
              <span>marks can go down, not only up</span>
            </div>
          </div>
          <p className={`wrap ${styles.factNote}`}>
            Guides tell students to have the photocopy checked by a teacher before applying. Most can&rsquo;t find one in time.
            Second Marker does that first check in minutes.
          </p>
        </section>

        <section id="how" className={`wrap ${styles.how}`}>
          <h2>How it works</h2>
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepN}>1</span>
              <h3>It reads your answer book</h3>
              <p>Your working, line by line, and every red mark the examiner wrote, including the total on the cover. If something can&rsquo;t be read, it says so instead of guessing.</p>
            </li>
            <li>
              <span className={styles.stepN}>2</span>
              <h3>It checks each answer against the scheme</h3>
              <p>The board&rsquo;s official marking scheme gives marks for steps. Each step is marked credited, written but not credited, or not written, with your own line quoted as proof.</p>
            </li>
            <li>
              <span className={styles.stepN}>3</span>
              <h3>It stamps DISPUTE or SKIP</h3>
              <p>Adding up, the possible gain, fees, the 10-question limit and the risk of losing marks are worked out by plain arithmetic, not guesswork. You confirm, then print a filing sheet.</p>
            </li>
          </ol>
          <div className={styles.verdicts}>
            <div className={styles.verdict}>
              <Stamp kind="DISPUTE" size="md" />
              <p>Scheme steps are clearly on your page but weren&rsquo;t given marks.</p>
            </div>
            <div className={styles.verdict}>
              <Stamp kind="SKIP" size="md" />
              <p>The marks match your working, or the examiner was already generous and a second look could cost you.</p>
            </div>
          </div>
        </section>

        <section className={`wrap ${styles.limits}`}>
          <h2>What it won&rsquo;t do</h2>
          <ul>
            <li>It doesn&rsquo;t file anything. You apply on the board&rsquo;s website yourself.</li>
            <li>It doesn&rsquo;t promise a result. The board decides; this gives you evidence and the odds.</li>
            <li>Right now it knows one paper: CBSE Class 12 Mathematics, 2025–26 sample paper, with its official marking scheme. More subjects need their schemes typed in first.</li>
          </ul>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className="wrap">
          <p>
            Sources:{" "}
            <a href="https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/Maths-MS.pdf">official marking scheme</a>,{" "}
            <a href="https://cbseacademic.nic.in/web_material/SQP/ClassXII_2025_26/Maths-SQP.pdf">sample paper</a>,{" "}
            <a href="https://www.pw.live/news/cbse-class-12-re-evaluation-2026">re-evaluation process and fees</a>,{" "}
            <a href="https://news.careers360.com/cbse-class-12-revaluation-verification-results-2025-out-at-results-cbse-nic-in/amp">28,000+ requests in 2025</a>.
          </p>
          <p>
            Not affiliated with CBSE. Built for Devpost&rsquo;s Build With AI: Basics, planned with the{" "}
            <a href="https://github.com/challengepost/learn-ai-basics">Devpost Learn skill pack</a>.
          </p>
        </div>
      </footer>
    </>
  );
}
