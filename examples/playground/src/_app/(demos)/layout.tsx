import type { ReactNode } from "react";

export default function DemosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="prose prose-sm prose-invert max-w-none">{children}</div>
  );
}
