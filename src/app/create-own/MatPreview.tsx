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

/** Returns true if the hex color is dark (luminance < 0.35) */
function isDarkMat(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  // Relative luminance (sRGB)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum < 0.35;
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
  "M 66,205 C 66,180 67,145 70,112 C 72,88 76,66 82,50 L 98,20 C 106,12 118,10 130,10 L 168,10 C 182,12 194,18 202,28 C 208,38 211,50 212,62 C 214,110 214,158 212,196 C 212,202 208,205 203,205 Z";

/** Driver front — tall, diagonal cut at top-RIGHT (shown on RIGHT) */
const FR =
  "M 262,205 C 262,180 262,150 264,118 C 266,96 272,76 284,60 C 292,50 304,44 318,42 L 348,40 C 356,40 364,42 370,48 L 398,84 C 402,92 403,102 403,112 C 404,140 402,170 400,196 C 400,204 396,205 392,205 Z";

/** Driver rear — short, center notch at top */
const RL =
  "M 68,392 C 66,380 67,362 70,346 C 73,330 80,318 90,310 C 100,302 112,298 124,296 C 132,294 138,292 142,288 C 148,282 150,274 150,266 C 150,258 144,254 136,254 C 128,254 120,258 120,266 C 120,274 122,282 128,288 C 132,292 138,294 146,296 C 158,298 170,302 180,310 C 190,318 197,330 200,346 C 203,362 202,380 200,392 Z";

/** Passenger rear — short, center notch at top (mirror of RL) */
const RR =
  "M 412,392 C 414,380 413,362 410,346 C 407,330 400,318 390,310 C 380,302 368,298 356,296 C 348,294 342,292 338,288 C 332,282 330,274 330,266 C 330,258 336,254 344,254 C 352,254 360,258 360,266 C 360,274 358,282 352,288 C 348,292 342,294 334,296 C 322,298 310,302 300,310 C 290,318 283,330 280,346 C 277,362 278,380 280,392 Z";

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
  heelPad,
  footrest,
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
  heelPad?: { x: number; y: number; w: number; h: number } | null;
  footrest?: { x: number; y: number; w: number; h: number } | null;
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
      {/* Heel pad — subtle embossed area where the heel rests */}
      {heelPad && (
        <rect
          x={heelPad.x} y={heelPad.y} width={heelPad.w} height={heelPad.h}
          rx="9"
          fill="rgba(0,0,0,0.16)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.8"
        />
      )}
      {/* Dead pedal / footrest — elongated raised area on driver side */}
      {footrest && (
        <rect
          x={footrest.x} y={footrest.y} width={footrest.w} height={footrest.h}
          rx="7"
          fill="rgba(0,0,0,0.14)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.8"
        />
      )}
      {/* Premium embroidered brand badge — adaptive contrast */}
      {withLogo && logo && (
        <g>
          {isDarkMat(bodyColorHex) ? (
            <>
              {/* DARK MAT (black, charcoal) — light badge with strong contrast */}
              <rect
                x="78" y="138" width="36" height="36" rx="6"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
              />
              <rect
                x="80" y="140" width="32" height="32" rx="5"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />
              <rect
                x="80" y="140" width="32" height="32" rx="5"
                fill="rgba(255,255,255,0.18)"
              />
              <image
                href={logo}
                x="83"
                y="143"
                width="26"
                height="26"
                preserveAspectRatio="xMidYMid meet"
                style={{ filter: isLightLogo(brandId) ? "none" : "invert(1)" }}
              />
            </>
          ) : (
            <>
              {/* LIGHT MAT (grey, cream) — dark badge with subtle contrast */}
              <rect
                x="78" y="138" width="36" height="36" rx="6"
                fill="none"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="1.2"
              />
              <rect
                x="80" y="140" width="32" height="32" rx="5"
                fill="none"
                stroke="rgba(0,0,0,0.12)"
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />
              <rect
                x="80" y="140" width="32" height="32" rx="5"
                fill="rgba(0,0,0,0.15)"
              />
              <image
                href={logo}
                x="83"
                y="143"
                width="26"
                height="26"
                preserveAspectRatio="xMidYMid meet"
                style={isLightLogo(brandId) ? {} : { filter: "invert(1)" }}
              />
            </>
          )}
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
          heelPad={{ x: 96, y: 172, w: 82, h: 20 }}
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
          heelPad={{ x: 316, y: 172, w: 82, h: 20 }}
          footrest={{ x: 292, y: 56, w: 30, h: 70 }}
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
