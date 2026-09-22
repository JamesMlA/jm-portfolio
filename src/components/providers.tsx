"use client";

import type { ReactNode } from "react";
import { useDocumentLang } from "./i18n";

export function Providers({ children }: { children: ReactNode }) {
  useDocumentLang();
  return <>{children}</>;
}
