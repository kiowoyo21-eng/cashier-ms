"use client";

import { useParams } from "next/navigation";
import SpreadsheetPageClient from "../../../components/SpreadsheetPageClient";

export default function IndividualWorkbook() {
  const { id } = useParams<{ id: string }>();
  const sheetId = typeof id === "string" && /^[a-z0-9-]{1,100}$/.test(id) ? id : undefined;
  return <SpreadsheetPageClient initialSheetId={sheetId} />;
}
