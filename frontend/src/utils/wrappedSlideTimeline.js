import gsap from "gsap";

const PEOPLE_SLIDE_INDEX = 3;
const INBOX_SLIDE_INDEX = 4;
const ACTIVITY_SLIDE_INDEX = 1;
const RHYTHM_SLIDE_INDEX = 2;
const INTRO_DROP_SLIDE_INDEX = 0;

const RHYTHM_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const INTRO_TITLE_BEAT = "title";
const INTRO_REST_LINE_BEATS = ["hero", "body"];
const DROP_CHAR_DURATION = 0.85;
const DROP_CHAR_STAGGER = 0.045;
const DROP_CHAR_EASE = "expo.inOut";
const INTRO_LINE_GAP = 0.4;

/** Stagger order for generic scene beats. */
const BEAT_SEQUENCE = [
  "eyebrow",
  "title",
  "deck",
  "hero",
  "avatar",
  "handle",
  "body",
  "stat",
  "stat-label",
  "stat-secondary",
  "quip",
  "chart",
  "footer"
];

const BEAT_GAP = 0.07;
const BEAT_DURATION = 0.38;
const SEGMENT_DURATION = 0.32;
const SEGMENT_STAGGER = 0.05;
const CARD_ENTER_DELAY = 0.14;

const DROP_FROM_Y = -120;
const DROP_DURATION = 0.62;
const DROP_EASE = "back.out(1.35)";
const DROP_STAGGER = 0.11;

export function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function makeTimeline({ durationMs, onComplete }) {
  return gsap.timeline({
    paused: true,
    onComplete
  });
}

function padTimeline(tl, totalSec) {
  const hold = Math.max(0.35, totalSec - tl.duration());
  tl.to({}, { duration: hold });
  return tl;
}

function resetMotionTargets(targets) {
  gsap.set(targets, { opacity: 1, y: 0, scale: 1, scaleX: 1, scaleY: 1, flexGrow: undefined });
}

function resetActivitySegments(segments) {
  segments.forEach((seg) => {
    const flex = parseFloat(seg.dataset.activityFlex) || 1;
    gsap.set(seg, { flexGrow: flex });
    const fill = seg.querySelector("[data-activity-bar-fill]");
    if (fill) {
      gsap.set(fill, { scaleY: 1, transformOrigin: "center top" });
    }
    seg.querySelectorAll("[data-activity-bar-label], [data-activity-bar-value]").forEach((el) => {
      gsap.set(el, { opacity: 1, x: 0, y: 0 });
    });
  });
}

function collectBeats(rootEl) {
  const beats = [];
  for (const name of BEAT_SEQUENCE) {
    rootEl.querySelectorAll(`[data-wrapped-beat="${name}"]`).forEach((el) => {
      beats.push(el);
    });
  }
  return beats;
}

function animateFadeBeat(tl, el, cursor, { duration = BEAT_DURATION, ease = "power2.out", fromY = 16 } = {}) {
  gsap.set(el, { opacity: 0, y: fromY });
  tl.to(el, { opacity: 1, y: 0, duration, ease }, cursor);
  return cursor + BEAT_GAP;
}

function animateDropBeat(tl, el, cursor, { duration = DROP_DURATION } = {}) {
  gsap.set(el, { opacity: 0, y: DROP_FROM_Y, scale: 1.06 });
  tl.to(
    el,
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration,
      ease: DROP_EASE
    },
    cursor
  );
  return cursor + DROP_STAGGER;
}

/** Default staggered reveal (Phase H baseline). */
function buildGenericTimeline(rootEl, { durationMs, template, onComplete, reduced }) {
  const beats = collectBeats(rootEl);
  const segments = [...rootEl.querySelectorAll("[data-wrapped-beat-segment]:not([data-wrapped-race-segment])")];
  const totalSec = Math.max(0.5, durationMs / 1000);
  const isTrust = template === "trust";
  const tl = makeTimeline({ durationMs, onComplete });
  const allTargets = [...beats, ...segments];

  if (!allTargets.length) {
    tl.to({}, { duration: totalSec });
    return tl;
  }

  if (reduced) {
    resetMotionTargets(allTargets);
    tl.to({}, { duration: totalSec });
    return tl;
  }

  gsap.set(beats, { opacity: 0, y: isTrust ? 8 : 16 });
  if (segments.length) {
    gsap.set(segments, {
      opacity: 0,
      scale: isTrust ? 1 : 0.92,
      y: isTrust ? 6 : 12
    });
  }

  let cursor = CARD_ENTER_DELAY;

  for (const el of beats) {
    tl.to(
      el,
      {
        opacity: 1,
        y: 0,
        duration: isTrust ? BEAT_DURATION * 0.85 : BEAT_DURATION,
        ease: isTrust ? "power1.out" : "power2.out"
      },
      cursor
    );
    cursor += isTrust ? BEAT_GAP * 0.75 : BEAT_GAP;
  }

  if (segments.length) {
    tl.to(
      segments,
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: SEGMENT_DURATION,
        stagger: SEGMENT_STAGGER,
        ease: "power2.out"
      },
      cursor
    );
  }

  return padTimeline(tl, totalSec);
}

/** Slide 0 — title drops first, then handle + activities + footer together. */
function buildIntroDropTimeline(rootEl, { durationMs, onComplete, reduced }) {
  const totalSec = Math.max(0.5, durationMs / 1000);
  const tl = makeTimeline({ durationMs, onComplete });
  const titleLine = rootEl.querySelector(`[data-wrapped-beat="${INTRO_TITLE_BEAT}"]`);
  const restLines = INTRO_REST_LINE_BEATS.map((beat) =>
    rootEl.querySelector(`[data-wrapped-beat="${beat}"]`)
  ).filter(Boolean);
  const footerEl = rootEl.querySelector('[data-wrapped-beat="footer"]');
  const titleChars = titleLine
    ? [...titleLine.querySelectorAll(".wrapped-drop-text__char")]
    : [];
  const restChars = restLines.flatMap((line) => [
    ...line.querySelectorAll(".wrapped-drop-text__char")
  ]);

  if (!titleLine && !restLines.length && !footerEl) {
    if (import.meta.env.DEV) {
      console.warn("[wrapped] intro slide: no drop lines found in", rootEl);
    }
    tl.to({}, { duration: totalSec });
    return tl;
  }

  if (reduced) {
    gsap.set([titleLine, ...restLines, footerEl].filter(Boolean), { autoAlpha: 1, opacity: 1, y: 0 });
    gsap.set([...titleChars, ...restChars], { yPercent: 0, visibility: "visible" });
    tl.to({}, { duration: totalSec });
    return tl;
  }

  gsap.set([titleLine, ...restLines].filter(Boolean), { autoAlpha: 1 });
  gsap.set(titleChars, { yPercent: -103, opacity: 1, visibility: "visible" });
  gsap.set(restChars, { yPercent: -103, opacity: 1, visibility: "visible" });
  if (footerEl) {
    gsap.set(footerEl, { opacity: 0, y: 14 });
  }

  let cursor = 0.25;

  if (titleChars.length) {
    tl.to(
      titleChars,
      {
        yPercent: 0,
        duration: DROP_CHAR_DURATION,
        stagger: DROP_CHAR_STAGGER,
        ease: DROP_CHAR_EASE
      },
      cursor
    );
    cursor += DROP_CHAR_DURATION + titleChars.length * DROP_CHAR_STAGGER + INTRO_LINE_GAP;
  }

  if (restChars.length) {
    tl.to(
      restChars,
      {
        yPercent: 0,
        duration: DROP_CHAR_DURATION,
        stagger: DROP_CHAR_STAGGER,
        ease: DROP_CHAR_EASE
      },
      cursor
    );
  }

  if (footerEl) {
    tl.to(
      footerEl,
      {
        opacity: 1,
        y: 0,
        duration: 0.48,
        ease: "power2.out"
      },
      cursor
    );
  }

  if (restChars.length) {
    cursor += DROP_CHAR_DURATION + restChars.length * DROP_CHAR_STAGGER;
  }

  return padTimeline(tl, totalSec);
}

/** Hero slides — header fades in, key type drops from above with bounce. */
function buildHeroDropTimeline(rootEl, { durationMs, onComplete, reduced }) {
  const beats = collectBeats(rootEl);
  const dropEls = [...rootEl.querySelectorAll("[data-wrapped-drop]")];
  const fadeBeats = beats.filter((el) => !el.hasAttribute("data-wrapped-drop") && !dropEls.includes(el));
  const totalSec = Math.max(0.5, durationMs / 1000);
  const tl = makeTimeline({ durationMs, onComplete });
  const allTargets = [...fadeBeats, ...dropEls];

  if (!allTargets.length) {
    tl.to({}, { duration: totalSec });
    return tl;
  }

  if (reduced) {
    resetMotionTargets(allTargets);
    tl.to({}, { duration: totalSec });
    return tl;
  }

  let cursor = CARD_ENTER_DELAY;

  for (const el of fadeBeats) {
    cursor = animateFadeBeat(tl, el, cursor);
  }

  for (const el of dropEls) {
    cursor = animateDropBeat(tl, el, cursor);
  }

  return padTimeline(tl, totalSec);
}

/** Slide 7 — top-3 stack bars race, then #1 surges ahead; podium pulses on win. */
function buildBarRaceTimeline(rootEl, { durationMs, onComplete, reduced }) {
  const beats = collectBeats(rootEl).filter(
    (el) => !el.closest("[data-wrapped-race-stack]")
  );
  const raceSegments = [...rootEl.querySelectorAll("[data-wrapped-race-segment]")].slice(0, 3);
  const podiumItems = [...rootEl.querySelectorAll("[data-podium-rank]")];
  const totalSec = Math.max(0.5, durationMs / 1000);
  const tl = makeTimeline({ durationMs, onComplete });

  if (reduced) {
    resetMotionTargets([...beats, ...raceSegments, ...podiumItems]);
    raceSegments.forEach((seg) => {
      const flex = parseFloat(seg.dataset.raceFlex) || 1;
      gsap.set(seg, { flexGrow: flex });
      const valEl = seg.querySelector("[data-race-count]");
      const target = parseInt(valEl?.dataset.raceCount ?? "0", 10);
      if (valEl && target > 0) {
        valEl.textContent = target.toLocaleString();
      }
    });
    tl.to({}, { duration: totalSec });
    return tl;
  }

  let cursor = CARD_ENTER_DELAY;

  for (const el of beats) {
    cursor = animateFadeBeat(tl, el, cursor, { fromY: 12 });
  }

  const raceStart = cursor + 0.08;
  const raceDuration = Math.min(3.6, totalSec * 0.52);
  const surgeAt = raceStart + raceDuration * 0.68;
  const surgeDuration = raceDuration * 0.32;

  gsap.set(podiumItems, { opacity: 0, y: 18, scale: 0.92 });
  tl.to(
    podiumItems,
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.42,
      stagger: 0.07,
      ease: "back.out(1.2)"
    },
    raceStart - 0.05
  );

  if (raceSegments.length) {
    const finals = raceSegments.map((seg) => parseFloat(seg.dataset.raceFlex) || 1);
    const flex2 = finals[1] ?? finals[0] * 0.7;
    const flex3 = finals[2] ?? finals[0] * 0.5;

    raceSegments.forEach((seg, index) => {
      const finalFlex = finals[index] ?? 1;
      gsap.set(seg, { flexGrow: 0.01, opacity: 1 });

      let interimFlex = finalFlex;
      if (index === 0 && raceSegments.length >= 2) {
        interimFlex = Math.max(flex2 * 0.94, finalFlex * 0.72);
      } else if (index === 1) {
        interimFlex = flex2;
      } else if (index === 2) {
        interimFlex = flex3 * 0.96;
      }

      tl.to(
        seg,
        {
          flexGrow: interimFlex,
          duration: raceDuration * 0.68,
          ease: "power2.out"
        },
        raceStart
      );

      if (index === 0) {
        tl.to(
          seg,
          {
            flexGrow: finalFlex,
            duration: surgeDuration,
            ease: "power3.out"
          },
          surgeAt
        );
      } else {
        tl.to(
          seg,
          {
            flexGrow: finalFlex,
            duration: surgeDuration * 0.85,
            ease: "power2.out"
          },
          surgeAt + 0.04
        );
      }

      const valEl = seg.querySelector("[data-race-count]");
      const target = parseInt(valEl?.dataset.raceCount ?? "0", 10);
      if (valEl && target > 0) {
        const counter = { v: 0 };
        tl.to(
          counter,
          {
            v: target,
            duration: raceDuration,
            ease: "power1.out",
            onUpdate: () => {
              valEl.textContent = Math.round(counter.v).toLocaleString();
            }
          },
          raceStart
        );
      }
    });

    const leadPodium = rootEl.querySelector('[data-podium-rank="0"]');
    if (leadPodium) {
      tl.to(
        leadPodium,
        {
          scale: 1.1,
          duration: 0.22,
          ease: "power2.out"
        },
        surgeAt + surgeDuration * 0.35
      );
      tl.to(
        leadPodium,
        {
          scale: 1,
          duration: 0.35,
          ease: "elastic.out(1, 0.55)"
        },
        surgeAt + surgeDuration * 0.55
      );
    }
  }

  return padTimeline(tl, totalSec);
}

function setStaticBeatsVisible(rootEl) {
  rootEl.querySelectorAll("[data-wrapped-beat-static]").forEach((el) => {
    gsap.set(el, { opacity: 1, y: 0, x: 0, scale: 1 });
  });
}

function buildRhythmDaySequence(winnerFull, flipCount = 16) {
  const winIdx = RHYTHM_WEEKDAYS.indexOf(winnerFull);
  const safeWin = winIdx >= 0 ? winIdx : 0;
  let hash = 0;
  for (let i = 0; i < winnerFull.length; i += 1) {
    hash = (hash * 31 + winnerFull.charCodeAt(i)) % 7;
  }
  const sequence = [RHYTHM_WEEKDAYS[hash]];
  for (let i = 1; i < flipCount; i += 1) {
    if (i === flipCount - 1) {
      sequence.push(RHYTHM_WEEKDAYS[safeWin]);
    } else {
      sequence.push(RHYTHM_WEEKDAYS[(hash + i * 4 + 1) % 7]);
    }
  }
  return sequence;
}

function appendWeekdayFlip(tl, { top, bottom, topLabel, bottomLabel, nextDay, duration, position, settle = false }) {
  bottomLabel.textContent = nextDay;

  tl.set(top, { rotateX: 0, transformOrigin: "center bottom" }, position);
  tl.set(bottom, { rotateX: 90, transformOrigin: "center top" }, position);
  tl.to(top, { rotateX: -90, duration: duration * 0.48, ease: "power2.in" }, position);
  tl.to(
    bottom,
    { rotateX: 0, duration: duration * 0.52, ease: "power2.out" },
    position + duration * 0.38
  );

  const end = position + duration;
  tl.add(() => {
    topLabel.textContent = nextDay;
    gsap.set(top, { rotateX: 0 });
    gsap.set(bottom, { rotateX: settle ? 0 : 90 });
    if (settle) {
      bottomLabel.textContent = nextDay;
    }
  }, end);

  return end;
}

/** Rhythm slide — static eyebrow, weekday flip, then title + quip together. */
function buildRhythmSlideTimeline(rootEl, { durationMs, onComplete, reduced }) {
  const totalSec = Math.max(0.5, durationMs / 1000);
  const tl = makeTimeline({ durationMs, onComplete });

  const flipRoot = rootEl.querySelector("[data-rhythm-winner]");
  const top = rootEl.querySelector("[data-rhythm-flip-top]");
  const bottom = rootEl.querySelector("[data-rhythm-flip-bottom]");
  const topLabel = rootEl.querySelector("[data-rhythm-day-top]");
  const bottomLabel = rootEl.querySelector("[data-rhythm-day-bottom]");
  const titleEl = rootEl.querySelector('[data-wrapped-beat="rhythm-title"]');
  const quipEl = rootEl.querySelector('[data-wrapped-beat="quip"]');
  const footerEl = rootEl.querySelector('[data-wrapped-beat="footer"]');
  const bodyEl = rootEl.querySelector('[data-wrapped-beat="body"]');

  setStaticBeatsVisible(rootEl);

  const revealEls = [titleEl, quipEl].filter(Boolean);

  if (!flipRoot || !top || !bottom || !topLabel || !bottomLabel) {
    return buildGenericTimeline(rootEl, { durationMs, template: "hero", onComplete, reduced });
  }

  const winner = flipRoot.dataset.rhythmWinner || RHYTHM_WEEKDAYS[0];
  const sequence = buildRhythmDaySequence(winner);

  if (reduced) {
    topLabel.textContent = winner;
    bottomLabel.textContent = winner;
    gsap.set([top, bottom], { rotateX: 0 });
    resetMotionTargets([...revealEls, footerEl, bodyEl].filter(Boolean));
    tl.to({}, { duration: totalSec });
    return tl;
  }

  topLabel.textContent = sequence[0];
  bottomLabel.textContent = sequence[1] ?? sequence[0];
  gsap.set(top, { rotateX: 0, transformOrigin: "center bottom" });
  gsap.set(bottom, { rotateX: 90, transformOrigin: "center top" });
  gsap.set(flipRoot, { opacity: 1 });

  if (revealEls.length) {
    gsap.set(revealEls, { opacity: 0, y: 14 });
  }
  if (footerEl) {
    gsap.set(footerEl, { opacity: 0, y: 14 });
  }
  if (bodyEl) {
    gsap.set(bodyEl, { opacity: 0, y: 14 });
  }

  let cursor = 0.35;
  for (let i = 1; i < sequence.length; i += 1) {
    const isLast = i === sequence.length - 1;
    const flipDur = isLast ? 0.34 : i > sequence.length - 4 ? 0.2 : 0.13;
    cursor = appendWeekdayFlip(tl, {
      top,
      bottom,
      topLabel,
      bottomLabel,
      nextDay: sequence[i],
      duration: flipDur,
      position: cursor,
      settle: isLast
    });
    cursor += isLast ? 0.08 : 0.03;
  }

  const revealAt = cursor + 0.22;
  const revealTargets = [...revealEls, footerEl].filter(Boolean);
  if (revealTargets.length) {
    tl.to(
      revealTargets,
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out" },
      revealAt
    );
  } else if (bodyEl) {
    tl.to(bodyEl, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, revealAt);
  }

  return padTimeline(tl, totalSec);
}

/** Activity slide — stacked bars grow first, then stat + quip + footer together. */
function buildActivitySlideTimeline(rootEl, { durationMs, onComplete, reduced }) {
  const totalSec = Math.max(0.5, durationMs / 1000);
  const tl = makeTimeline({ durationMs, onComplete });

  const chartEl = rootEl.querySelector('[data-wrapped-beat="chart"]');
  const segments = [...rootEl.querySelectorAll("[data-activity-segment]")];
  const statEl = rootEl.querySelector('[data-wrapped-beat="stat"]');
  const statLabelEl = rootEl.querySelector('[data-wrapped-beat="stat-label"]');
  const quipEl = rootEl.querySelector('[data-wrapped-beat="quip"]');
  const footerEl = rootEl.querySelector('[data-wrapped-beat="footer"]');
  const bodyEl = rootEl.querySelector('[data-wrapped-beat="body"]');

  const summaryEls = [statEl, statLabelEl, quipEl].filter(Boolean);

  if (!chartEl || !segments.length) {
    return buildGenericTimeline(rootEl, {
      durationMs,
      template: "data",
      onComplete,
      reduced
    });
  }

  if (reduced) {
    resetActivitySegments(segments);
    resetMotionTargets([chartEl, ...summaryEls, footerEl, bodyEl].filter(Boolean));
    setStaticBeatsVisible(rootEl);
    tl.to({}, { duration: totalSec });
    return tl;
  }

  setStaticBeatsVisible(rootEl);

  gsap.set(chartEl, { opacity: 1 });
  segments.forEach((seg) => {
    const flex = parseFloat(seg.dataset.activityFlex) || 1;
    gsap.set(seg, { flexGrow: flex, opacity: 1 });

    const fill = seg.querySelector("[data-activity-bar-fill]");
    if (fill) {
      gsap.set(fill, { scaleY: 0, transformOrigin: "center top" });
    }

    const label = seg.querySelector("[data-activity-bar-label]");
    const value = seg.querySelector("[data-activity-bar-value]");
    if (label) {
      gsap.set(label, { opacity: 0, x: -12, y: 6 });
    }
    if (value) {
      gsap.set(value, { opacity: 0, x: 12, y: 6 });
    }
  });

  if (summaryEls.length) {
    gsap.set(summaryEls, { opacity: 0, y: 14 });
  }
  if (footerEl) {
    gsap.set(footerEl, { opacity: 0, y: 14 });
  }
  if (bodyEl) {
    gsap.set(bodyEl, { opacity: 0, y: 14 });
  }

  const stackStart = 0.2;
  const growDuration = 0.68;
  const barPause = 0.42;
  const labelDuration = 0.32;

  // Top-down: comments → likes → media → story interactions; pause between each
  let cursor = stackStart;
  segments.forEach((seg) => {
    const fill = seg.querySelector("[data-activity-bar-fill]");
    const label = seg.querySelector("[data-activity-bar-label]");
    const value = seg.querySelector("[data-activity-bar-value]");

    if (fill) {
      tl.to(fill, { scaleY: 1, duration: growDuration, ease: "power3.out" }, cursor);
    }

    const labelAt = cursor + growDuration * 0.58;
    if (label) {
      tl.to(
        label,
        { opacity: 1, x: 0, y: 0, duration: labelDuration, ease: "power2.out" },
        labelAt
      );
    }
    if (value) {
      tl.to(
        value,
        { opacity: 1, x: 0, y: 0, duration: labelDuration, ease: "power2.out" },
        labelAt + 0.09
      );
    }

    cursor += growDuration + barPause;
  });

  const stackEnd = cursor - barPause;
  const revealAt = stackEnd + 0.28;
  const revealTargets = [...summaryEls, footerEl].filter(Boolean);

  if (revealTargets.length) {
    tl.to(
      revealTargets,
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out" },
      revealAt
    );
  } else if (bodyEl) {
    tl.to(bodyEl, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, revealAt);
  }

  return padTimeline(tl, totalSec);
}

function peopleLabelOpacity(rank, topN) {
  if (rank <= topN) {
    return 1;
  }
  if (rank >= topN + 1) {
    return 0;
  }
  return 1 - (rank - topN);
}

function setPeopleLabelAtProgress(labelEl, coords, progress, topN) {
  if (!coords.length) {
    return;
  }
  const maxIdx = coords.length - 1;
  const t = Math.max(0, Math.min(maxIdx, progress));
  const i = Math.floor(t);
  const frac = t - i;
  const p0 = coords[i];
  const p1 = coords[Math.min(i + 1, maxIdx)];
  const y = p0.y + (p1.y - p0.y) * frac;
  const rank = p0.rank + (p1.rank - p0.rank) * frac;
  gsap.set(labelEl, { attr: { y }, opacity: peopleLabelOpacity(rank, topN) });
}

/** People slide — fluid rank lines with labels traveling on the right. */
function buildPeopleSlideTimeline(rootEl, { durationMs, onComplete, reduced }) {
  const totalSec = Math.max(0.5, durationMs / 1000);
  const tl = makeTimeline({ durationMs, onComplete });

  setStaticBeatsVisible(rootEl);

  const chartEl = rootEl.querySelector("[data-people-chart]");
  const seriesGroups = [...rootEl.querySelectorAll("[data-people-series]")];
  const quipEl = rootEl.querySelector('[data-wrapped-beat="quip"]');
  const footerEl = rootEl.querySelector('[data-wrapped-beat="footer"]');
  const bodyEl = rootEl.querySelector('[data-wrapped-beat="body"]');
  const topN = parseInt(chartEl?.dataset.peopleTopN ?? "5", 10);

  if (!seriesGroups.length) {
    return buildGenericTimeline(rootEl, {
      durationMs,
      template: "data",
      onComplete,
      reduced
    });
  }

  const seriesMeta = seriesGroups.map((groupEl) => {
    const pathEl = groupEl.querySelector("[data-people-path]");
    const labelEl = groupEl.querySelector("[data-people-label]");
    let coords = [];
    if (labelEl?.dataset.peopleCoords) {
      try {
        coords = JSON.parse(labelEl.dataset.peopleCoords);
      } catch {
        coords = [];
      }
    }
    const len = pathEl?.getTotalLength?.() || 1;
    return { pathEl, labelEl, coords, len };
  }).filter((row) => row.pathEl);

  if (reduced) {
    seriesMeta.forEach(({ pathEl, labelEl, coords }) => {
      gsap.set(pathEl, { strokeDashoffset: 0, opacity: 1 });
      if (labelEl && coords.length) {
        const last = coords[coords.length - 1];
        gsap.set(labelEl, {
          attr: { y: last.y },
          opacity: peopleLabelOpacity(last.rank, topN)
        });
      }
    });
    resetMotionTargets([quipEl, footerEl, bodyEl].filter(Boolean));
    if (chartEl) {
      gsap.set(chartEl, { opacity: 1 });
    }
    tl.to({}, { duration: totalSec });
    return tl;
  }

  if (chartEl) {
    gsap.set(chartEl, { opacity: 1 });
  }

  seriesMeta.forEach(({ pathEl, labelEl, coords, len }) => {
    gsap.set(pathEl, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
    if (labelEl && coords.length) {
      setPeopleLabelAtProgress(labelEl, coords, 0, topN);
    }
  });

  if (quipEl) {
    gsap.set(quipEl, { opacity: 0, y: 14 });
  }
  if (footerEl) {
    gsap.set(footerEl, { opacity: 0, y: 14 });
  }
  if (bodyEl) {
    gsap.set(bodyEl, { opacity: 0, y: 14 });
  }

  const drawStart = 0.25;
  const drawDuration = Math.min(5.2, totalSec * 0.58);
  const seriesStagger = 0.06;

  seriesMeta.forEach(({ pathEl, labelEl, coords }, index) => {
    const start = drawStart + index * seriesStagger;
    tl.to(
      pathEl,
      { strokeDashoffset: 0, duration: drawDuration, ease: "none" },
      start
    );

    if (labelEl && coords.length > 1) {
      const state = { progress: 0 };
      tl.to(
        state,
        {
          progress: coords.length - 1,
          duration: drawDuration,
          ease: "none",
          onUpdate: () => {
            setPeopleLabelAtProgress(labelEl, coords, state.progress, topN);
          }
        },
        start
      );
    }
  });

  const revealAt = drawStart + drawDuration + seriesStagger * seriesMeta.length + 0.2;
  const revealTargets = [quipEl, footerEl].filter(Boolean);
  if (revealTargets.length) {
    tl.to(
      revealTargets,
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out" },
      revealAt
    );
  } else if (bodyEl) {
    tl.to(bodyEl, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, revealAt);
  }

  return padTimeline(tl, totalSec);
}

const INBOX_STACK_PEEK = 12;
const INBOX_EXPAND_GAP = 10;

function measureInboxStack(stackEl) {
  const stage = stackEl.querySelector("[data-inbox-stage]");
  const items = [...stackEl.querySelectorAll("[data-inbox-item]")];
  const leadCard = items[0]?.querySelector(".inbox-notif-card");
  const cardH = leadCard?.offsetHeight ?? 86;
  const threadWrap = stackEl.querySelector("[data-inbox-thread-wrap]");
  const threadEl = stackEl.querySelector("[data-inbox-thread-reveal]");
  let threadH = 28;
  if (threadEl) {
    const prev = {
      opacity: threadEl.style.opacity,
      visibility: threadEl.style.visibility,
      position: threadEl.style.position
    };
    threadEl.style.opacity = "1";
    threadEl.style.visibility = "hidden";
    threadEl.style.position = "absolute";
    threadH = Math.ceil(threadEl.scrollHeight || threadEl.offsetHeight) + 8;
    threadEl.style.opacity = prev.opacity;
    threadEl.style.visibility = prev.visibility;
    threadEl.style.position = prev.position;
  }
  return { stage, items, cardH, threadWrap, threadEl, threadH };
}

function inboxStackHeight(cardH, count, peek = INBOX_STACK_PEEK) {
  return cardH + Math.max(0, count - 1) * peek;
}

function inboxExpandedHeight(cardH, count, gap = INBOX_EXPAND_GAP) {
  return count * cardH + Math.max(0, count - 1) * gap;
}

function layoutInboxStack(stackEl, { expanded = false, revealed = false } = {}) {
  const { stage, items, cardH, threadWrap, threadEl, threadH } = measureInboxStack(stackEl);
  const count = items.length;

  if (expanded) {
    stackEl.classList.add("inbox-notif-stack--expanded");
    gsap.set(stage, { height: inboxExpandedHeight(cardH, count) });
    items.forEach((item, index) => {
      gsap.set(item, {
        y: index * (cardH + INBOX_EXPAND_GAP),
        scale: 1,
        opacity: 1,
        zIndex: count - index
      });
    });
  } else {
    stackEl.classList.remove("inbox-notif-stack--expanded");
    gsap.set(stage, { height: inboxStackHeight(cardH, count) });
    items.forEach((item, index) => {
      gsap.set(item, {
        y: index * INBOX_STACK_PEEK,
        scale: 1 - index * 0.012,
        opacity: index === 0 ? 1 : 0,
        zIndex: count - index
      });
    });
  }

  const privacy = stackEl.querySelector("[data-inbox-privacy]");
  if (revealed && threadWrap && threadEl) {
    gsap.set(privacy, { opacity: 0 });
    gsap.set(threadWrap, { height: threadH });
    gsap.set(threadEl, { opacity: 1 });
  } else if (threadWrap && threadEl) {
    gsap.set(privacy, { opacity: 1 });
    gsap.set(threadWrap, { height: 0 });
    gsap.set(threadEl, { opacity: 0 });
  }
}

/** Inbox slide — 1→N stack growth, iOS expand, sender reveal, then copy. */
function buildInboxSlideTimeline(rootEl, { durationMs, onComplete, reduced }) {
  const totalSec = Math.max(0.5, durationMs / 1000);
  const tl = makeTimeline({ durationMs, onComplete });

  setStaticBeatsVisible(rootEl);

  const stackEl = rootEl.querySelector("[data-inbox-stack]");
  const descEl = rootEl.querySelector('[data-wrapped-beat="inbox-desc"]');
  const statEl = rootEl.querySelector('[data-wrapped-beat="stat"]');
  const statLabelEl = rootEl.querySelector('[data-wrapped-beat="stat-label"]');
  const balanceEl = rootEl.querySelector('[data-wrapped-beat="inbox-balance"]');
  const balanceLabelEl = rootEl.querySelector('[data-wrapped-beat="inbox-balance-label"]');
  const quipEl = rootEl.querySelector('[data-wrapped-beat="quip"]');
  const footerEl = rootEl.querySelector('[data-wrapped-beat="footer"]');
  const bodyEl = rootEl.querySelector('[data-wrapped-beat="body"]');

  const copyBeats = [
    descEl,
    statEl,
    statLabelEl,
    balanceEl,
    balanceLabelEl,
    quipEl
  ].filter(Boolean);

  if (!stackEl) {
    return buildGenericTimeline(rootEl, {
      durationMs,
      template: "hero",
      onComplete,
      reduced
    });
  }

  let { stage, items, cardH, threadWrap, threadEl, threadH } = measureInboxStack(stackEl);
  const privacyEl = stackEl.querySelector("[data-inbox-privacy]");

  if (!items.length || !stage) {
    return buildGenericTimeline(rootEl, {
      durationMs,
      template: "hero",
      onComplete,
      reduced
    });
  }

  if (reduced) {
    layoutInboxStack(stackEl, { expanded: true, revealed: true });
    gsap.set(stackEl, { opacity: 1, y: 0, scale: 1 });
    resetMotionTargets([...copyBeats, footerEl, bodyEl].filter(Boolean));
    tl.to({}, { duration: totalSec });
    return tl;
  }

  layoutInboxStack(stackEl, { expanded: false, revealed: false });
  gsap.set(stackEl, { opacity: 1, y: 0, scale: 1 });
  gsap.set(copyBeats, { opacity: 0, y: 14 });
  if (footerEl) {
    gsap.set(footerEl, { opacity: 0, y: 10 });
  }

  let cursor = 0.2;
  const addStep = 0.52;
  const stackInDur = 0.48;

  for (let index = 1; index < items.length; index += 1) {
    const item = items[index];
    const stackY = index * INBOX_STACK_PEEK;
    const targetOpacity = Math.max(0.78, 1 - index * 0.08);

    tl.fromTo(
      item,
      { opacity: 0, y: stackY + 18, scale: 0.97 },
      {
        opacity: targetOpacity,
        y: stackY,
        scale: 1 - index * 0.012,
        duration: stackInDur,
        ease: "power2.out"
      },
      cursor
    );
    tl.to(
      stage,
      { height: inboxStackHeight(cardH, index + 1), duration: stackInDur, ease: "power2.out" },
      cursor
    );
    cursor += addStep;
  }

  cursor += 0.38;

  const expandDur = 0.92;

  tl.add(() => {
    const measured = measureInboxStack(stackEl);
    cardH = measured.cardH;
    threadH = measured.threadH;
    threadWrap = measured.threadWrap;
    threadEl = measured.threadEl;
  }, cursor);

  const expandedH = () => inboxExpandedHeight(cardH, items.length);

  tl.add(() => stackEl.classList.add("inbox-notif-stack--expanded"), cursor);
  tl.to(stage, { height: expandedH(), duration: expandDur, ease: "power3.inOut" }, cursor);
  items.forEach((item, index) => {
    tl.to(
      item,
      {
        y: index * (cardH + INBOX_EXPAND_GAP),
        scale: 1,
        opacity: 1,
        duration: expandDur,
        ease: "power3.inOut"
      },
      cursor
    );
  });

  const revealAt = cursor + expandDur * 0.55;
  tl.to(privacyEl, { opacity: 0, duration: 0.28, ease: "power2.in" }, revealAt);
  tl.to(
    threadWrap,
    { height: threadH, duration: 0.45, ease: "power3.out" },
    revealAt + 0.08
  );
  tl.to(threadEl, { opacity: 1, duration: 0.34, ease: "power2.out" }, revealAt + 0.18);

  cursor += expandDur + 0.45;

  tl.to(
    stackEl,
    { opacity: 0.32, scale: 0.96, y: -6, duration: 0.45, ease: "power2.inOut" },
    cursor
  );
  cursor += 0.2;

  copyBeats.forEach((el) => {
    cursor = animateFadeBeat(tl, el, cursor, { duration: 0.42, fromY: 10 });
  });

  if (footerEl) {
    tl.to(footerEl, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, cursor);
  }

  return padTimeline(tl, totalSec);
}

/**
 * Build a GSAP timeline for one slide's scene beats, padded to durationMs.
 */
export function createSlideBeatTimeline(
  rootEl,
  { slideIndex = 0, durationMs = 5500, template = "hero", onComplete } = {}
) {
  if (!rootEl) {
    return null;
  }

  const reduced = prefersReducedMotion();

  if (slideIndex === INTRO_DROP_SLIDE_INDEX) {
    return buildIntroDropTimeline(rootEl, { durationMs, onComplete, reduced });
  }

  if (slideIndex === ACTIVITY_SLIDE_INDEX) {
    return buildActivitySlideTimeline(rootEl, { durationMs, onComplete, reduced });
  }

  if (slideIndex === RHYTHM_SLIDE_INDEX) {
    return buildRhythmSlideTimeline(rootEl, { durationMs, onComplete, reduced });
  }

  if (slideIndex === PEOPLE_SLIDE_INDEX) {
    return buildPeopleSlideTimeline(rootEl, { durationMs, onComplete, reduced });
  }

  if (slideIndex === INBOX_SLIDE_INDEX) {
    return buildInboxSlideTimeline(rootEl, { durationMs, onComplete, reduced });
  }

  return buildGenericTimeline(rootEl, { durationMs, template, onComplete, reduced });
}

/** Kill a timeline and clear refs safely. */
export function killSlideTimeline(timeline) {
  if (timeline) {
    timeline.kill();
  }
}
