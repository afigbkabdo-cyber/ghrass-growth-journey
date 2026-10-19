const RECOVERY_KEY = "ghiras.chunk-recovery";
const RETRY_WINDOW_MS = 60_000;

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk .+ failed/i.test(message);
}

/** Refresh stale route references once; persistent failures retain the error screen. */
export function recoverChunkLoad(
  error: unknown,
  browser: { sessionStorage: Pick<Storage, "getItem" | "setItem">; location: { reload: () => void } },
  now = Date.now(),
): boolean {
  if (!isChunkLoadError(error)) return false;
  try {
    const previous = Number(browser.sessionStorage.getItem(RECOVERY_KEY));
    if (previous > 0 && now - previous < RETRY_WINDOW_MS) return false;
    browser.sessionStorage.setItem(RECOVERY_KEY, String(now));
  } catch {
    // Without a durable guard, automatic reload could loop indefinitely.
    return false;
  }
  browser.location.reload();
  return true;
}