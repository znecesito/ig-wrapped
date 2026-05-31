/**
 * Layman explanation of parse warnings for the Wrapped lobby.
 * @param {string} message
 * @returns {{ summary: string, impact: string, slides: string[] }}
 */
export function explainParseWarning(message) {
  const text = String(message || "").trim();
  const lower = text.toLowerCase();

  if (
    lower.includes("message") ||
    lower.includes("inbox") ||
    lower.includes("thread") ||
    lower.includes("dm")
  ) {
    return {
      summary: text,
      impact: "Inbox slides may be missing or incomplete.",
      slides: ["Your inbox personality", "You vs them"]
    };
  }

  if (
    lower.includes("social") ||
    lower.includes("liked") ||
    lower.includes("comment") ||
    lower.includes("story") ||
    lower.includes("follower") ||
    lower.includes("following")
  ) {
    return {
      summary: text,
      impact: "Social interaction leaderboards may be incomplete.",
      slides: ["Your #1 person", "Top accounts"]
    };
  }

  if (
    lower.includes("activity") ||
    lower.includes("heatmap") ||
    lower.includes("media") ||
    lower.includes("timestamp") ||
    lower.includes("expected an array")
  ) {
    return {
      summary: text,
      impact:
        "Activity totals, date span, rhythm stats, and your feed personality may be affected.",
      slides: ["Activity span", "Activity", "Feed personality"]
    };
  }

  if (lower.includes("json") || lower.includes("parse") || lower.includes("could not read")) {
    return {
      summary: text,
      impact: "One or more slides may show less data than expected.",
      slides: ["Various"]
    };
  }

  return {
    summary: text,
    impact: "Some story cards may show less data than expected.",
    slides: ["Various"]
  };
}

/**
 * @param {string[]} warnings
 */
export function explainParseWarnings(warnings) {
  if (!warnings?.length) {
    return [];
  }
  return warnings.map((w) => explainParseWarning(w));
}
