"use client";

import { useMemo, useState } from "react";
import { Ledger } from "@/components/Ledger";
import { analyse } from "@/lib/analyse";
import { DEFAULT_FEE_PER_QUESTION } from "@/lib/ledger";
import scheme from "@/data/schemes/cbse-xii-maths-2025-26";
import { fixtureReadings, fixtureResults } from "@/data/fixture";

export default function CheckPage() {
  const analysis = useMemo(() => analyse(scheme, fixtureReadings, fixtureResults), []);
  const [rows, setRows] = useState(analysis.ledger);
  const [fee, setFee] = useState(DEFAULT_FEE_PER_QUESTION);
  const t = analysis.totals;

  return (
    <main className="wrap" style={{ padding: "32px 20px" }}>
      <div className="sheet sheet--plain" style={{ marginBottom: 20 }}>
        <p style={{ margin: 0 }}>
          Cover total <strong className="num">{t.cover}</strong> · marks added up <strong className="num">{t.added}</strong>{" "}
          {t.issues.length === 0 ? <span className="tag tag--green">adds up</span> : <span className="tag tag--red">{t.issues.length} issue(s)</span>}
        </p>
      </div>
      <Ledger
        rows={rows}
        fee={fee}
        onFeeChange={setFee}
        onToggle={(n) => setRows((rs) => rs.map((r) => (r.number === n ? { ...r, selected: !r.selected } : r)))}
        animate
      />
    </main>
  );
}
