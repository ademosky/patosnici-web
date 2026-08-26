"use client";

import { brands } from "../data/brands";

function brandLogo(brandId: string) {
  return brands.find((b) => b.id === brandId)?.logo ?? "";
}

// ── MatPreview ──────────────────────────────────────────────────────────────
//
// Premium Apple-style product showcase. 4-mat layout viewed from above.
//   - Dark graphite gradient background for contrast against black mats
//   - Large, visually dominant mats with fabric texture and subtle depth
//   - No visible container — open, minimal, premium
//   - Red border only on selected state (handled by parent via step/highlight)
//
// Props:
//   bodyColorHex   — fill color of the mat body
//   borderColorHex — color of the outer seam / border
//   withLogo       — render brand logo on the driver front mat?
//   brandId        — resolves the logo from brands.ts
//   highlight      — if true, red outline on the active mat

type MatPreviewProps = {
  bodyColorHex: string;
  borderColorHex: string;
  withLogo: boolean;
  brandId: string | null;
  highlight?: boolean;
};

// ── Shape paths (viewBox 0 0 480 400) ─────────────────────────────────────
// Realistic mat shapes: wider bottom, narrower top, diagonal cuts, rounded corners.

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

/** Single mat drawn at a given offset (x, y) */
function Mat({
  d,
  bodyColorHex,
  borderColorHex,
  withLogo,
  logo,
  highlight,
  hasClips = false,
  clipX1,
  clipY1,
  clipX2,
  clipY2,
}: {
  d: string;
  bodyColorHex: string;
  borderColorHex: string;
  withLogo: boolean;
  logo: string;
  highlight: boolean;
  hasClips: boolean;
  clipX1: number;
  clipY1: number;
  clipX2: number;
  clipY2: number;
}) {
  return (
    <g filter="url(#sh)">
      {/* Body fill */}
      <path d={d} fill={bodyColorHex} />
      {/* Fabric texture overlay */}
      <path d={d} fill={bodyColorHex} filter="url(#tex)" />
      {/* Subtle inner highlight for material depth */}
      <path d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinejoin="round" />
      {/* Outer seam — subtle dark gray, or red if highlighted */}
      <path
        d={d}
        fill="none"
        stroke={highlight ? borderColorHex : "rgba(255,255,255,0.08)"}
        strokeWidth={highlight ? "3.5" : "2"}
        strokeLinejoin="round"
      />
      {/* Mounting clips */}
      {hasClips && (
        <>
          <ellipse cx={clipX1} cy={clipY1} rx="3.5" ry="2.5" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
          <ellipse cx={clipX2} cy={clipY2} rx="3.5" ry="2.5" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
        </>
      )}
      {/* Brand logo */}
      {withLogo && logo && (
        <>
          <rect x={highlight ? 98 : 100} y={highlight ? 66 : 68} width="70" height="24" rx="4" fill="rgba(0,0,0,0.55)" />
          <image
            href={logo}
            x={highlight ? 101 : 103}
            y={highlight ? 69 : 71}
            width="64"
            height="18"
            preserveAspectRatio="xMidYMid meet"
            style={{ filter: "invert(1)" }}
          />
        </>
      )}
    </g>
  );
}

export default function MatPreview({
  bodyColorHex,
  borderColorHex,
  withLogo,
  brandId,
  highlight = false,
}: MatPreviewProps) {
  const logo = brandId ? brandLogo(brandId) : "";

  return (
    <div className="relative mx-auto w-full max-w-md">
      <svg
        viewBox="0 0 480 420"
        className="h-auto w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Fabric texture — clips to the source shape */}
          <filter id="tex" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.82"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.08 0 0 0 0 0.08 0 0 0 0 0.08 0 0 0 0.14 0"
              in="noise"
              result="tinted"
            />
            <feComposite in="tinted" in2="SourceGraphic" operator="in" result="clipped" />
            <feBlend in="SourceGraphic" in2="clipped" mode="screen" />
          </filter>

          {/* Soft drop shadow for realistic depth */}
          <filter id="sh" x="-15%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.55" />
          </filter>

          {/* Dark graphite gradient background */}
          <radialGradient id="bg" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="60%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </radialGradient>
        </defs>

        {/* Background — dark graphite radial gradient */}
        <rect width="480" height="420" fill="url(#bg)" />

        {/* Driver Front */}
        <Mat
          d={FL}
          bodyColorHex={bodyColorHex}
          borderColorHex={borderColorHex}
          withLogo={withLogo}
          logo={logo}
          highlight={highlight}
          hasClips={true}
          clipX1={102}
          clipY1={188}
          clipX2={164}
          clipY2={188}
        />

        {/* Passenger Front */}
        <Mat
          d={FR}
          bodyColorHex={bodyColorHex}
          borderColorHex={borderColorHex}
          withLogo={false}
          logo=""
          highlight={highlight}
          hasClips={true}
          clipX1={316}
          clipY1={188}
          clipX2={378}
          clipY2={188}
        />

        {/* Driver Rear */}
        <Mat
          d={RL}
          bodyColorHex={bodyColorHex}
          borderColorHex={borderColorHex}
          withLogo={false}
          logo=""
          highlight={highlight}
          hasClips={false}
          clipX1={0}
          clipY1={0}
          clipX2={0}
          clipY2={0}
        />

        {/* Passenger Rear */}
        <Mat
          d={RR}
          bodyColorHex={bodyColorHex}
          borderColorHex={borderColorHex}
          withLogo={false}
          logo=""
          highlight={highlight}
          hasClips={false}
          clipX1={0}
          clipY1={0}
          clipX2={0}
          clipY2={0}
        />
      </svg>
    </div>
  );
}
