"use client";

interface MatSilhouetteProps {
  fillColor: string;
  className?: string;
}

/**
 * Minimalist car floor mat silhouette used in the color picker.
 * All three swatches share the same shape — only the fill color changes.
 *
 * Path design: wider bottom, narrower top, diagonal cut at top-right
 * (driver's side), rounded corners, mounting holes.
 */
export default function MatSilhouette({ fillColor, className = "" }: MatSilhouetteProps) {
  return (
    <svg
      viewBox="0 0 120 160"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Subtle drop shadow for depth */}
        <filter id="matsh" x="-10%" y="-5%" width="120%" height="115%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Outer mat shape */}
      <path
        d="M22,142 L90,142 C96,142 100,138 102,132 C104,115 104,100 102,85 L90,50 C86,40 76,32 60,32 C44,32 34,40 30,50 L18,85 C16,100 16,115 18,132 C18,138 18,142 22,142 Z"
        fill={fillColor}
        filter="url(#matsh)"
      />

      {/* Subtle inner contour for depth */}
      <path
        d="M28,134 L82,134 C86,134 90,131 92,126 C94,110 94,96 92,82 L82,53 C78,45 70,40 60,40 C50,40 42,45 38,53 L28,82 C26,96 26,110 28,126 C28,131 28,134 28,134 Z"
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="1"
      />

      {/* Mounting holes */}
      <ellipse cx="43" cy="128" rx="3" ry="2.2" fill="rgba(0,0,0,0.35)" />
      <ellipse cx="63" cy="128" rx="3" ry="2.2" fill="rgba(0,0,0,0.35)" />

      {/* Highlight edge (top-left) */}
      <path
        d="M22,138 C22,134 22,115 22,100 C22,85 24,65 28,50"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
