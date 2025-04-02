const DEBUG =
  process.env.DEBUG === "*" || process.env.DEBUG === "next-globe-gen";

export default function debugLog(message: string) {
  if (DEBUG) {
    console.log(`[NextGlobeGen] ${message}`);
  }
}
