import React, { useMemo } from "react";
import { cn } from "../lib/utils.js";
import { PEOPLE_RANK_TOP_N } from "../utils/peopleRankHistory.js";

/** Distinct line colors (not accent-tinted). */
const LINE_COLORS = ["#e11d48", "#4f46e5", "#0ea5e4", "#d97706", "#9333ea", "#059669", "#db2777", "#64748b"];

export const CHART_W = 420;
export const CHART_H = 320;
export const CHART_PAD = { top: 38, right: 100, bottom: 20, left: 42 };

function plotWidth() {
  return CHART_W - CHART_PAD.left - CHART_PAD.right;
}

function plotHeight() {
  return CHART_H - CHART_PAD.top - CHART_PAD.bottom;
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

function formatHandle(username) {
  const bare = String(username ?? "").replace(/^@/, "");
  return `@${bare.length > 12 ? `${bare.slice(0, 11)}…` : bare}`;
}

function pointsToPath(points) {
  if (!points.length) {
    return "";
  }
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

/** Horizontal rank-over-time chart for the People slide. */
export default function PeopleRankChart({ history, className = "" }) {
  const monthCount = history?.monthLabels?.length ?? 0;
  const topN = history?.topN ?? PEOPLE_RANK_TOP_N;

  const seriesData = useMemo(() => {
    if (!history?.series?.length || monthCount < 2) {
      return [];
    }
    return history.series.map((row, seriesIndex) => {
      const color = LINE_COLORS[seriesIndex % LINE_COLORS.length];
      const coords = row.points.map((pt) => ({
        x: xForMonth(pt.monthIndex, monthCount),
        y: yForRank(pt.rank, topN),
        rank: pt.rank,
        monthIndex: pt.monthIndex,
        inTop: pt.inTop
      }));
      return {
        username: row.username,
        color,
        pathD: pointsToPath(coords),
        coords
      };
    });
  }, [history, monthCount, topN]);

  if (!history || !seriesData.length) {
    return null;
  }

  const rankLabels = Array.from({ length: topN }, (_, i) => `#${i + 1}`);

  return (
    <div
      className={cn(
        "people-rank-chart mx-auto w-full max-w-[min(100%,26rem)]",
        className
      )}
      data-wrapped-beat="chart"
      data-people-chart
      data-people-top-n={topN}
    >
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label="Top accounts rank over the last twelve months"
      >
        {history.monthLabels.map((label, i) => (
          <text
            key={`${label}-${i}`}
            x={xForMonth(i, monthCount)}
            y={14}
            textAnchor="middle"
            className="fill-slate-500 text-[0.58rem] font-semibold"
          >
            {label}
          </text>
        ))}

        {rankLabels.map((label, i) => {
          const y = yForRank(i + 1, topN);
          return (
            <g key={label}>
              <line
                x1={CHART_PAD.left}
                y1={y}
                x2={CHART_W - CHART_PAD.right}
                y2={y}
                className="stroke-slate-300/60"
                strokeWidth="1"
                strokeDasharray="4 5"
              />
              <text
                x={CHART_PAD.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[0.62rem] font-bold"
              >
                {label}
              </text>
            </g>
          );
        })}

        {seriesData.map((row) => (
          <g key={row.username} data-people-series={row.username}>
            <path
              data-people-path
              d={row.pathD}
              fill="none"
              stroke={row.color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              data-people-label
              data-people-coords={JSON.stringify(row.coords)}
              x={CHART_W - 6}
              y={row.coords[0]?.y ?? plotTop()}
              textAnchor="end"
              dominantBaseline="middle"
              fill={row.color}
              className="text-[0.64rem] font-extrabold"
            >
              {formatHandle(row.username)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
