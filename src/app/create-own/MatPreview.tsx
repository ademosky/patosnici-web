"use client";

import { brands } from "../data/brands";

function brandLogo(brandId: string) {
  return brands.find((b) => b.id === brandId)?.logo ?? "";
}

// ── MatPreview ──────────────────────────────────────────────────────────────
//
// Generic 4-mat layout viewed from above. Shapes match the reference visual:
//   - Front mats: tall, with diagonal cut at top corner (driver top-right,
//     passenger top-left) and two mounting clips near the bottom.
//   - Rear mats: shorter, with a center top notch (tunnel hump cutout).
//
// To swap the visual later, edit ONLY the SVG paths / filter below.
// The ConfiguratorClient does NOT need to change — it passes props here.
//
// Props:
//   bodyColorHex   — fill color of the mat body
//   borderColorHex — color of the outer seam / border
//   withLogo       — render brand logo on the driver front mat?
//   brandId        — resolves the logo from brands.ts

type MatPreviewProps = {
  bodyColorHex: string;
  borderColorHex: string;
  withLogo: boolean;
  brandId: string | null;
};

// ── Shape paths (viewBox 0 0 480 400) ─────────────────────────────────────
// Each mat is drawn clockwise from the bottom-left.
// Quadratic bezier (Q cx,cy x,y) rounds the corners.

/** Driver front — tall, diagonal cut at top-RIGHT */
const FL =
  "M68,205 L208,205 Q216,205 216,197 L216,74 L175,20 L68,20 Q52,20 52,35 L52,197 Q52,205 68,205 Z";

/** Passenger front — tall, diagonal cut at top-LEFT */
const FR =
  "M412,205 L272,205 Q264,205 264,197 L264,74 L305,20 L412,20 Q428,20 428,35 L428,197 Q428,205 412,205 Z";

/** Driver rear — short, center notch at top */
const RL =
  "M68,392 L208,392 Q217,392 217,382 L217,294 Q217,279 201,279 L163,279 L163,261 Q163,251 150,251 L128,251 Q116,251 116,261 L116,279 L77,279 Q58,279 58,294 L58,382 Q58,392 68,392 Z";

/** Passenger rear — short, center notch at top (mirror of RL) */
const RR =
  "M412,392 L272,392 Q263,392 263,382 L263,294 Q263,279 279,279 L317,279 L317,261 Q317,251 330,251 L352,251 Q364,251 364,261 L364,279 L403,279 Q422,279 422,294 L422,382 Q422,392 412,392 Z";

export default function MatPreview({
  bodyColorHex,
  borderColorHex,
  withLogo,
  brandId,
}: MatPreviewProps) {
  const logo = brandId ? brandLogo(brandId) : "";

  return (
    <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl bg-[#141414] p-5">
      <svg
        viewBox="0 0 480 400"
        className="h-auto w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle fabric texture — clips to the source shape */}
          <filter id="tex" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.78"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0.18 0"
              in="noise"
              result="tinted"
            />
            <feComposite in="tinted" in2="SourceGraphic" operator="in" result="clipped" />
            <feBlend in="SourceGraphic" in2="clipped" mode="screen" />
          </filter>

          {/* Drop shadow for depth */}
          <filter id="sh" x="-15%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#000" floodOpacity="0.72" />
          </filter>
        </defs>

        {/* Dark background */}
        <rect width="480" height="400" rx="14" fill="#141414" />

        {/* ── DRIVER FRONT (left) ── */}
        <g filter="url(#sh)">
          {/* Body fill */}
          <path d={FL} fill={bodyColorHex} />
          {/* Fabric texture overlay */}
          <path d={FL} fill={bodyColorHex} filter="url(#tex)" />
          {/* Outer seam / border */}
          <path d={FL} fill="none" stroke={borderColorHex} strokeWidth="4.5" strokeLinejoin="round" />
          {/* Mounting clips */}
          <circle cx="102" cy="188" r="5.5" fill="#242424" stroke="#111" strokeWidth="1.5" />
          <circle cx="164" cy="188" r="5.5" fill="#242424" stroke="#111" strokeWidth="1.5" />
          {/* Brand logo (when selected) */}
          {withLogo && logo && (
            <>
              <rect x="102" y="70" width="66" height="22" rx="4" fill="rgba(0,0,0,0.55)" />
              <image
                href={logo}
                x="105"
                y="73"
                width="60"
                height="16"
                preserveAspectRatio="xMidYMid meet"
                style={{ filter: "invert(1)" }}
              />
            </>
          )}
        </g>

        {/* ── PASSENGER FRONT (right) ── */}
        <g filter="url(#sh)">
          <path d={FR} fill={bodyColorHex} />
          <path d={FR} fill={bodyColorHex} filter="url(#tex)" />
          <path d={FR} fill="none" stroke={borderColorHex} strokeWidth="4.5" strokeLinejoin="round" />
          <circle cx="316" cy="188" r="5.5" fill="#242424" stroke="#111" strokeWidth="1.5" />
          <circle cx="378" cy="188" r="5.5" fill="#242424" stroke="#111" strokeWidth="1.5" />
        </g>

        {/* ── DRIVER REAR (left) ── */}
        <g filter="url(#sh)">
          <path d={RL} fill={bodyColorHex} />
          <path d={RL} fill={bodyColorHex} filter="url(#tex)" />
          <path d={RL} fill="none" stroke={borderColorHex} strokeWidth="4.5" strokeLinejoin="round" />
        </g>

        {/* ── PASSENGER REAR (right) ── */}
        <g filter="url(#sh)">
          <path d={RR} fill={bodyColorHex} />
          <path d={RR} fill={bodyColorHex} filter="url(#tex)" />
          <path d={RR} fill="none" stroke={borderColorHex} strokeWidth="4.5" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

