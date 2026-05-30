/** Wrapped only uses the most recent 365 days when the export spans longer. */
export const WRAPPED_ACTIVITY_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * @param {{ timestampMs: number }[]} events
 * @returns {{ events: typeof events, trimmed: boolean, spanDays: number | null }}
 */
export function filterActivityEventsForWrapped(events) {
  if (!events?.length) {
    return { events: events ?? [], trimmed: false, spanDays: null };
  }

  let minMs = Infinity;
  let maxMs = -Infinity;
  for (const eventItem of events) {
    const t = eventItem.timestampMs;
    if (t == null || Number.isNaN(t)) {
      continue;
    }
    minMs = Math.min(minMs, t);
    maxMs = Math.max(maxMs, t);
  }

  if (!Number.isFinite(minMs) || !Number.isFinite(maxMs)) {
    return { events, trimmed: false, spanDays: null };
  }

  const spanMs = maxMs - minMs;
  const spanDays = Math.ceil(spanMs / (24 * 60 * 60 * 1000));

  if (spanMs <= WRAPPED_ACTIVITY_WINDOW_MS) {
    return { events, trimmed: false, spanDays };
  }

  const cutoffMs = maxMs - WRAPPED_ACTIVITY_WINDOW_MS;
  const filtered = events.filter((e) => e.timestampMs >= cutoffMs);
  return { events: filtered, trimmed: true, spanDays };
}
