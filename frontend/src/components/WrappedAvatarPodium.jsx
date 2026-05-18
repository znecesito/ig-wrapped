import React from "react";
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

function PodiumAvatar({ row, rank, threadLabels, imageUrl }) {
  const key = avatarKeyForWrappedRow(row, { threadLabels });
  const initials = initialsForWrappedRow(row, { threadLabels });
  const bg = avatarColorForKey(key);
  const count = row.count ?? row.messageCount ?? 0;
  const href = threadLabels ? threadProfileHref(row.label) : profileHref(row.username);
  const isLead = rank === 1;

  const circle = (
    <span
      className={`wrapped-podium__avatar${isLead ? " wrapped-podium__avatar--lead" : ""}`}
      style={{ backgroundColor: bg }}
      aria-hidden={Boolean(imageUrl)}
    >
      {imageUrl ? (
        <img
          className="wrapped-podium__img"
          src={imageUrl}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      <span className="wrapped-podium__initials">{initials}</span>
      <span className="wrapped-podium__badge">{rank}</span>
    </span>
  );

  return (
    <li className={`wrapped-podium__item${isLead ? " wrapped-podium__item--lead" : ""}`}>
      {href ? (
        <a
          className="wrapped-podium__avatar-link"
          href={href}
          target="_blank"
          rel="noreferrer"
          title={threadLabels ? row.label : `@${String(row.username).replace(/^@/, "")}`}
        >
          {circle}
        </a>
      ) : (
        <span className="wrapped-podium__avatar-link" title={row.label}>
          {circle}
        </span>
      )}
      <span className="wrapped-podium__count">{formatCount(count)}</span>
    </li>
  );
}

export default function WrappedAvatarPodium({ rows, threadLabels = false }) {
  if (!rows?.length) {
    return null;
  }

  return (
    <ol className="wrapped-podium" aria-label="Top accounts">
      {rows.map((row, index) => (
        <PodiumAvatar
          key={row.username ?? row.threadKey ?? row.label ?? index}
          row={row}
          rank={index + 1}
          threadLabels={threadLabels}
          imageUrl={row.imageUrl}
        />
      ))}
    </ol>
  );
}
