import React, { useMemo } from "react";
import { cn } from "../lib/utils.js";
import { PEOPLE_RANK_TOP_N } from "../utils/peopleRankHistory.js";
import {
  CHART_H,
  CHART_PAD,
  CHART_W,
  peopleLabelOpacity,
  xForMonth,
  yForRank
} from "../utils/peopleRankChartLayout.js";

/** Distinct line colors (not accent-tinted). */
const LINE_COLORS = ["#e11d48", "#4f46e5", "#0ea5e4", "#d97706", "#9333ea", "#059669", "#db2777", "#64748b"];

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
        rank: pt.rank
      }));
      const first = coords[0];
      return {
        username: row.username,
        color,
        pathD: pointsToPath(coords),
        ranks: row.points.map((pt) => pt.rank),
        labelY: first?.y ?? yForRank(topN + 1, topN),
        labelOpacity: peopleLabelOpacity(first?.rank ?? topN + 1, topN)
      };
    });
  }, [history, monthCount, topN]);

  if (!history || !seriesData.length) {
    return null;
  }

  const rankLabels = Array.from({ length: topN }, (_, i) => `#${i + 1}`);

  return (
    <div
      className={cn("people-rank-chart mx-auto w-full max-w-[min(100%,26rem)]", className)}
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
              data-people-ranks={row.ranks.join(",")}
              data-people-months={monthCount}
              x={CHART_W - 6}
              y={row.labelY}
              textAnchor="end"
              dominantBaseline="middle"
              fill={row.color}
              opacity={row.labelOpacity}
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
