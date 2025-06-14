
/**
 * Utility for parsing retrieved chunks from various storage formats.
 * Accepts stringified JSON, array, or null.
 */
export function getRetrievedChunks(raw: any) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
