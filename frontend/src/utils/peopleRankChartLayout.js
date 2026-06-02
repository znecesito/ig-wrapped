import { PEOPLE_RANK_TOP_N } from "./peopleRankHistory.js";

export const CHART_W = 420;
export const CHART_H = 320;
export const CHART_PAD = { top: 38, right: 100, bottom: 20, left: 42 };

function plotWidth() {
  return CHART_W - CHART_PAD.left - CHART_PAD.right;
}

function plotTop() {
  return CHART_PAD.top + 10;
}

function plotBottom() {
  return CHART_H - CHART_PAD.bottom;
}

export function xForMonth(index, monthCount) {
  if (monthCount <= 1) {
    return CHART_PAD.left + plotWidth() / 2;
  }
  return CHART_PAD.left + (index / (monthCount - 1)) * plotWidth();
}

export function yForRank(rank, topN = PEOPLE_RANK_TOP_N) {
  const top = plotTop();
  const bottom = plotBottom();
  const h = bottom - top;
  const clamped = Math.max(1, Math.min(topN + 1, rank));
  return top + ((clamped - 1) / topN) * h;
}

/** Fade labels as rank slips past top N (6 → fully hidden). */
export function peopleLabelOpacity(rank, topN = PEOPLE_RANK_TOP_N) {
  if (rank <= topN) {
    return 1;
  }
  if (rank >= topN + 1) {
    return 0;
  }
  return 1 - (rank - topN);
}
