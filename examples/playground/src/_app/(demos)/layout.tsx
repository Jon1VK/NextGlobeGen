import type { ReactNode } from "react";

export default function DemosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="prose prose-sm prose-invert max-w-none prose-h1:text-xl prose-h1:font-bold">
      {children}
    </div>
  );
}
