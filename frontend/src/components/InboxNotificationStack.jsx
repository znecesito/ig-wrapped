import React from "react";
import { cn } from "../lib/utils.js";

function NotificationCard({ threadName, isLead }) {
  return (
    <article
      className={cn(
        "inbox-notif-card",
        isLead ? "inbox-notif-card--lead" : "inbox-notif-card--stack"
      )}
      data-inbox-card={isLead ? "lead" : "stack"}
    >
      <div className="inbox-notif-card__row">
        <span className="inbox-notif-card__icon" aria-hidden>
          <span className="inbox-notif-card__icon-inner" />
        </span>
        <div className="inbox-notif-card__main">
          <header className="inbox-notif-card__header">
            <h2 className="inbox-notif-card__app">Instagram</h2>
            <span className="inbox-notif-card__time">now</span>
          </header>
          <div className="inbox-notif-card__content">
            <p className="inbox-notif-card__privacy" data-inbox-privacy>
              Notification from Instagram
            </p>
            {isLead ? (
              <div className="inbox-notif-card__thread-wrap" data-inbox-thread-wrap>
                <p className="inbox-notif-card__thread" data-inbox-thread-reveal>
                  {threadName}
                </p>
              </div>
            ) : null}
            <p className="inbox-notif-card__message">You have new messages</p>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Stacked IG notifications — grows 1→N, then expands vertically (iOS-style).
 */
export default function InboxNotificationStack({
  threadName = "this chat",
  stackCount = 4,
  className = ""
}) {
  const count = Math.min(5, Math.max(2, stackCount));

  return (
    <div
      className={cn("inbox-notif-stack mx-auto w-full max-w-[min(100%,20rem)]", className)}
      data-inbox-stack
      data-inbox-count={count}
      aria-hidden
    >
      <div className="inbox-notif-stack__stage" data-inbox-stage>
        <ul className="inbox-notif-stack__list">
          {Array.from({ length: count }, (_, index) => (
            <li
              key={index}
              className="inbox-notif-stack__item"
              data-inbox-item
              data-inbox-index={index}
            >
              <NotificationCard threadName={threadName} isLead={index === 0} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
