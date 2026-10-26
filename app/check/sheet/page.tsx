import type { Metadata } from "next";
import { FilingSheet } from "@/components/FilingSheet";

export const metadata: Metadata = { title: "Filing sheet — Second Marker" };

export default function SheetPage() {
  return <FilingSheet />;
}
