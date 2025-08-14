import type { ReactNode } from "react";

export default function DemosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="prose prose-sm prose-invert prose-h1:text-xl prose-h1:font-bold max-w-none">
      {children}
    </div>
  );
}
