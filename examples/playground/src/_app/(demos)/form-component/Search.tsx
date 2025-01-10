"use client";

import { useSearchParams } from "next/navigation";

export default function Search() {
  const search = useSearchParams();
  return <pre>{JSON.stringify([...search.entries()])}</pre>;
}
