import React from "react";
import { cn } from "../lib/utils.js";
import {
  SPOTLIGHT_AVATAR,
  SPOTLIGHT_AVATAR_INITIALS,
  SPOTLIGHT_AVATAR_RING,
  SPOTLIGHT_HANDLE
} from "./wrappedSlideClasses.js";
import {
  avatarColorForKey,
  avatarKeyForWrappedRow,
  initialsForWrappedRow
} from "../utils/wrappedAvatars.js";

/**
 * Spotlight slide hero — avatar + @handle (Phase H beat targets via data-wrapped-beat).
 */
export default function WrappedSpotlightHero({ name, row, threadLabels = false }) {
  if (!name) {
    return null;
  }

  const key = row ? avatarKeyForWrappedRow(row, { threadLabels }) : name;
  const initials = row ? initialsForWrappedRow(row, { threadLabels }) : (name.replace(/^@/, "")[0] || "?").toUpperCase();
  const bg = avatarColorForKey(key);

  return (
    <div className="wrapped-spotlight-hero flex flex-col items-center gap-2.5" data-wrapped-beat="hero">
      <div
        className={SPOTLIGHT_AVATAR_RING}
        data-wrapped-beat="avatar"
        data-wrapped-drop
        aria-hidden
      >
        <span className={SPOTLIGHT_AVATAR} style={{ backgroundColor: bg }}>
          <span className={SPOTLIGHT_AVATAR_INITIALS}>{initials}</span>
        </span>
      </div>
      <p className={cn(SPOTLIGHT_HANDLE, "m-0")} data-wrapped-beat="handle" data-wrapped-drop>
        {name}
      </p>
    </div>
  );
}
