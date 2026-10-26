import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckApp } from "@/components/CheckApp";

export const metadata: Metadata = { title: "Check an answer book — Second Marker" };

export default function CheckPage() {
  return (
    <Suspense>
      <CheckApp />
    </Suspense>
  );
}
