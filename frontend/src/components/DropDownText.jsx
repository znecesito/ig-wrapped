import React from "react";
import { cn } from "../lib/utils.js";

/**
 * Character cells for GSAP drop-down text (CodePen-style slot reveal).
 * @see https://codepen.io/lilili846244g/pen/RwJeYde
 */
export default function DropDownText({ text, beat, className = "" }) {
  if (!text) {
    return null;
  }

  const chars = [...String(text)];

  return (
    <div
      className={cn("wrapped-drop-text", className)}
      data-wrapped-beat={beat}
      aria-label={String(text)}
    >
      {chars.map((char, index) => {
        const display = char === " " ? "\u00a0" : char;
        return (
          <span
            key={`${beat}-${index}-${char}`}
            className="wrapped-drop-text__char"
            data-drop-char={display}
            aria-hidden={char === " " ? true : undefined}
          >
            {display}
          </span>
        );
      })}
    </div>
  );
}
