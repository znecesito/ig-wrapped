import React from "react";
import { cn } from "../lib/utils.js";
import { SLIDE_HERO_DISPLAY } from "./wrappedSlideClasses.js";

/** Full weekday names in calendar order (Sun → Sat). */
export const RHYTHM_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const SHORT_TO_FULL = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday"
};

/** Calendar-style flip card — weekday flutter driven by GSAP in wrappedSlideTimeline. */
export default function RhythmDayFlip({ activeWeekday, displayWeekday, className = "" }) {
  const winner =
    displayWeekday ||
    SHORT_TO_FULL[activeWeekday] ||
    (activeWeekday && RHYTHM_WEEKDAYS.find((d) => d.startsWith(activeWeekday))) ||
    RHYTHM_WEEKDAYS[0];

  const startIdx = RHYTHM_WEEKDAYS.indexOf(winner);
  const startDay = RHYTHM_WEEKDAYS[startIdx >= 0 ? (startIdx + 5) % 7 : 0];
  const nextDay = RHYTHM_WEEKDAYS[(RHYTHM_WEEKDAYS.indexOf(startDay) + 1) % 7];

  return (
    <div
      className={cn("rhythm-day-flip", className)}
      data-wrapped-beat="rhythm-day"
      data-rhythm-winner={winner}
    >
      <div className="rhythm-day-flip__viewport">
        <div className="rhythm-day-flip__half rhythm-day-flip__half--top" data-rhythm-flip-top>
          <span className={cn(SLIDE_HERO_DISPLAY, "rhythm-day-flip__label")} data-rhythm-day-top>
            {startDay}
          </span>
        </div>
        <div className="rhythm-day-flip__half rhythm-day-flip__half--bottom" data-rhythm-flip-bottom>
          <span className={cn(SLIDE_HERO_DISPLAY, "rhythm-day-flip__label")} data-rhythm-day-bottom>
            {nextDay}
          </span>
        </div>
      </div>
    </div>
  );
}
