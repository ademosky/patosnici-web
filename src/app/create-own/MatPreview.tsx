"use client";

import { brands, type Brand } from "../data/brands";

function getBrand(brandId: string): Brand | undefined {
  return brands.find((b) => b.id === brandId);
}

function brandLogo(brandId: string) {
  return getBrand(brandId)?.logo ?? "";
}

function isLightLogo(brandId: string) {
  return getBrand(brandId)?.lightLogo === true;
}

// ── MatPreview ──────────────────────────────────────────────────────────────
//
// Premium Apple-style product showcase. 4-mat layout viewed from above.
//   - Lighter graphite gradient background for clear contrast against black mats
//   - Large, visually dominant mats with fabric texture and subtle depth
//   - No visible container — open, minimal, premium
//   - Border color always reflects the selected borderColorHex
//
// Props:
//   bodyColorHex   — fill color of the mat body
//   borderColorHex — color of the outer seam / border (always applied)
//   withLogo       — render brand logo on the driver front mat?
//   brandId        — resolves the logo from brands.ts

type MatPreviewProps = {
  bodyColorHex: string;
  borderColorHex: string;
  withLogo: boolean;
  brandId: string | null;
};

// ── Shape paths (viewBox 0 0 480 400) ─────────────────────────────────────
// Realistic mat shapes: wider bottom, narrower top, diagonal cuts, rounded corners.

/** Passenger front — tall, diagonal cut at top-LEFT (shown on LEFT) */
const FL =
  "M68,205 L208,205 Q216,205 216,197 L216,20 L105,20 L52,74 L52,197 Q52,205 68,205 Z";

/** Driver front — tall, diagonal cut at top-RIGHT (shown on RIGHT) */
const FR =
  "M412,205 L272,205 Q264,205 264,197 L264,20 L375,20 L428,74 L428,197 Q428,205 412,205 Z";

/** Driver rear — short, center notch at top */
const RL =
  "M68,392 L208,392 Q217,392 217,382 L217,294 Q217,279 201,279 L163,279 L163,261 Q163,251 150,251 L128,251 Q116,251 116,261 L116,279 L77,279 Q58,279 58,294 L58,382 Q58,392 68,392 Z";

/** Passenger rear — short, center notch at top (mirror of RL) */
const RR =
  "M412,392 L272,392 Q263,392 263,382 L263,294 Q263,279 279,279 L317,279 L317,261 Q317,251 330,251 L352,251 Q364,251 364,261 L364,279 L403,279 Q422,279 422,294 L422,382 Q422,392 412,392 Z";

/** Single mat drawn at a given offset */
function Mat({
  d,
  bodyColorHex,
  borderColorHex,
  withLogo,
  logo,
  hasClips = false,
  clipX1,
  clipY1,
  clipX2,
  clipY2,
  brandId,
}: {
  d: string;
  bodyColorHex: string;
  borderColorHex: string;
  withLogo: boolean;
  logo: string;
  hasClips: boolean;
  clipX1: number;
  clipY1: number;
  clipX2: number;
  clipY2: number;
  brandId?: string | null;
}) {
  return (
    <g filter="url(#sh)">
      {/* Body fill */}
      <path d={d} fill={bodyColorHex} />
      {/* Fabric texture overlay */}
      <path d={d} fill={bodyColorHex} filter="url(#tex)" />
      {/* Subtle inner highlight for material depth */}
      <path d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" strokeLinejoin="round" />
      {/* Outer seam / border — always the selected border color */}
      <path
        d={d}
        fill="none"
        stroke={borderColorHex}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Mounting clips */}
      {hasClips && (
        <>
          <ellipse cx={clipX1} cy={clipY1} rx="3.5" ry="2.5" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
          <ellipse cx={clipX2} cy={clipY2} rx="3.5" ry="2.5" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
        </>
      )}
      {/* Brand logo — bottom-left, above mounting holes (reference position) */}
      {withLogo && logo && (
        <g opacity="0.85">
          <rect x="65" y="152" width="48" height="14" rx="3" fill={isLightLogo(brandId) ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.45)"} />
          <image
            href={logo}
            x="67"
            y="154"
            width="44"
            height="10"
            preserveAspectRatio="xMidYMid meet"
            style={isLightLogo(brandId) ? {} : { filter: "invert(1)" }}
          />
        </g>
      )}
    </g>
  );
}

export default function MatPreview({
  bodyColorHex,
  borderColorHex,
  withLogo,
  brandId,
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
              baseFrequency="0.8"
              numOctaves="3"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.06 0 0 0 0 0.06 0 0 0 0 0.06 0 0 0 0.10 0"
              in="noise"
              result="tinted"
            />
            <feComposite in="tinted" in2="SourceGraphic" operator="in" result="clipped" />
            <feBlend in="SourceGraphic" in2="clipped" mode="screen" />
          </filter>

          {/* Soft drop shadow for realistic depth */}
          <filter id="sh" x="-15%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.5" />
          </filter>

          {/* Lighter graphite gradient background — clear contrast for black mats */}
          <radialGradient id="bg" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#3d3f45" />
            <stop offset="55%" stopColor="#2a2c31" />
            <stop offset="100%" stopColor="#1c1e22" />
          </radialGradient>
        </defs>

        {/* Background — lighter graphite radial gradient */}
        <rect width="480" height="420" fill="url(#bg)" />

        {/* Passenger Front (left) — with logo */}
        <Mat
          d={FL}
          bodyColorHex={bodyColorHex}
          borderColorHex={borderColorHex}
          withLogo={withLogo}
          logo={logo}
          hasClips={true}
          clipX1={102}
          clipY1={188}
          clipX2={164}
          clipY2={188}
          brandId={brandId}
        />

        {/* Driver Front (right) — no logo */}
        <Mat
          d={FR}
          bodyColorHex={bodyColorHex}
          borderColorHex={borderColorHex}
          withLogo={false}
          logo=""
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
