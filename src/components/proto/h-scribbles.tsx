/**
 * Hand-drawn SVG marks for prototype H: underline, circle, arrow, star.
 * Strokes are wobbly paths (not geometric shapes) and "draw on" once via the
 * .h-draw class (stroke-dash animation, defined in the page; skipped under
 * reduced motion). All decorative: aria-hidden.
 */
import type { CSSProperties } from "react";

type P = { className?: string; color?: string; style?: CSSProperties; delay?: number };

const common = (color: string, delay = 0): React.SVGProps<SVGPathElement> => ({
  fill: "none",
  stroke: color,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  pathLength: 1,
  className: "h-draw",
  style: { animationDelay: `${delay}s` },
});

export function Underline({ className, color = "#c8321e", style, delay }: P) {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 20" preserveAspectRatio="none" className={className} style={style}>
      <path d="M3 13 C 60 6, 120 4, 180 9 S 270 15, 297 7" strokeWidth="4" {...common(color, delay)} />
      <path d="M20 17 C 90 11, 170 12, 260 14" strokeWidth="2.5" {...common(color, (delay ?? 0) + 0.25)} />
    </svg>
  );
}

export function Circle({ className, color = "#1f4fd1", style, delay }: P) {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 120" preserveAspectRatio="none" className={className} style={style}>
      <path
        d="M160 12 C 80 6, 12 30, 10 62 C 8 98, 90 114, 170 110 C 250 106, 296 82, 290 52 C 284 20, 210 6, 120 14 C 90 17, 70 22, 60 26"
        strokeWidth="3.5"
        {...common(color, delay)}
      />
    </svg>
  );
}

export function Arrow({ className, color = "#1d1b17", style, delay, flip }: P & { flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 80"
      className={className}
      style={{ ...style, transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path d="M6 10 C 30 60, 70 70, 108 56" strokeWidth="3" {...common(color, delay)} />
      <path d="M92 44 L 110 56 L 92 70" strokeWidth="3" {...common(color, (delay ?? 0) + 0.45)} />
    </svg>
  );
}

export function Star({ className, color = "#c8321e", style, delay }: P) {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className={className} style={style}>
      <path d="M20 4 L 23 16 L 36 18 L 25 24 L 28 37 L 20 29 L 11 36 L 14 24 L 4 18 L 17 16 Z" strokeWidth="2.5" {...common(color, delay)} />
    </svg>
  );
}
