import React from "react";
import { cn } from "../lib/utils.js";
import {
  PODIUM,
  PODIUM_AVATAR,
  PODIUM_AVATAR_LEAD,
  PODIUM_AVATAR_LINK,
  PODIUM_BADGE,
  PODIUM_COUNT,
  PODIUM_COUNT_LEAD,
  PODIUM_FACE,
  PODIUM_FACE_LEAD,
  PODIUM_IMG,
  PODIUM_INITIALS,
  PODIUM_INITIALS_LEAD,
  PODIUM_ITEM,
  PODIUM_ITEM_LEAD
} from "./wrappedSlideClasses.js";
import {
  avatarColorForKey,
  avatarKeyForWrappedRow,
  initialsForWrappedRow
} from "../utils/wrappedAvatars.js";

const IG_PROFILE_BASE_URL = "https://www.instagram.com/";

function formatCount(n) {
  return typeof n === "number" ? n.toLocaleString() : n;
}

function profileHref(username) {
  const bare = String(username || "").replace(/^@/, "").trim();
  if (!bare || !/^[\w.]+$/.test(bare)) {
    return null;
  }
  return `${IG_PROFILE_BASE_URL}${encodeURIComponent(bare)}/`;
}

/** Single @handle in a DM thread title → profile link; groups return null. */
function threadProfileHref(label) {
  const t = String(label || "").trim();
  if (!t || t.includes(",") || /\s+and\s+/i.test(t)) {
    return null;
  }
  const bare = t.startsWith("@") ? t.slice(1) : t;
  return profileHref(bare);
}

function PodiumAvatar({ row, rank, threadLabels, imageUrl, raceMode }) {
  const key = avatarKeyForWrappedRow(row, { threadLabels });
  const initials = initialsForWrappedRow(row, { threadLabels });
  const bg = avatarColorForKey(key);
  const count = row.count ?? row.messageCount ?? 0;
  const href = threadLabels ? threadProfileHref(row.label) : profileHref(row.username);
  const isLead = rank === 1;

  const circle = (
    <span className={cn(PODIUM_AVATAR, isLead && PODIUM_AVATAR_LEAD)} aria-hidden={Boolean(imageUrl)}>
      <span className={cn(PODIUM_FACE, isLead && PODIUM_FACE_LEAD)} style={{ backgroundColor: bg }}>
        {imageUrl ? (
          <img
            className={PODIUM_IMG}
            src={imageUrl}
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
        <span className={cn(PODIUM_INITIALS, isLead && PODIUM_INITIALS_LEAD)}>{initials}</span>
      </span>
      <span className={PODIUM_BADGE}>{rank}</span>
    </span>
  );

  return (
    <li
      className={cn(PODIUM_ITEM, isLead && PODIUM_ITEM_LEAD)}
      {...(raceMode
        ? { "data-podium-rank": String(rank - 1) }
        : { "data-wrapped-beat-segment": true })}
    >
      {href ? (
        <a
          className={PODIUM_AVATAR_LINK}
          href={href}
          target="_blank"
          rel="noreferrer"
          title={threadLabels ? row.label : `@${String(row.username).replace(/^@/, "")}`}
        >
          {circle}
        </a>
      ) : (
        <span className={PODIUM_AVATAR_LINK} title={row.label}>
          {circle}
        </span>
      )}
      <span className={cn(PODIUM_COUNT, isLead && PODIUM_COUNT_LEAD)}>{formatCount(count)}</span>
    </li>
  );
}

export default function WrappedAvatarPodium({ rows, threadLabels = false, raceMode = false }) {
  if (!rows?.length) {
    return null;
  }

  return (
    <ol className={PODIUM} aria-label="Top accounts">
      {rows.map((row, index) => (
        <PodiumAvatar
          key={row.username ?? row.threadKey ?? row.label ?? index}
          row={row}
          rank={index + 1}
          threadLabels={threadLabels}
          imageUrl={row.imageUrl}
          raceMode={raceMode}
        />
      ))}
    </ol>
  );
}
