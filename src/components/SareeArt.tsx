import { useId } from "react";
import type { SareeArt as Art } from "@/lib/types";

// Illustrated folded saree, used until real product photos are uploaded.

function Motif({ motif, color }: { motif: Art["motif"]; color: string }) {
  switch (motif) {
    case "buti":
      return (
        <g fill={color}>
          <path d="M18 8c4 5 4 10 0 14-4-4-4-9 0-14z" />
          <path d="M18 22c-3 0-6 2-7 4 3 1 6 0 7-4zm0 0c3 0 6 2 7 4-3 1-6 0-7-4z" opacity=".85" />
          <path d="M54 44c4 5 4 10 0 14-4-4-4-9 0-14z" />
          <path d="M54 58c-3 0-6 2-7 4 3 1 6 0 7-4zm0 0c3 0 6 2 7 4-3 1-6 0-7-4z" opacity=".85" />
        </g>
      );
    case "paisley":
      return (
        <g fill={color}>
          <path d="M16 26c-6-2-7-10-2-14 5-3 11 0 11 6 0 4-2 7-5 9 3-4 2-8-1-9-3 0-4 4-3 8z" />
          <path d="M52 62c-6-2-7-10-2-14 5-3 11 0 11 6 0 4-2 7-5 9 3-4 2-8-1-9-3 0-4 4-3 8z" />
        </g>
      );
    case "jaal":
      return (
        <g fill="none" stroke={color} strokeWidth="1.4">
          <path d="M0 36 36 0 72 36 36 72z" opacity=".7" />
          <circle cx="36" cy="36" r="5" fill={color} stroke="none" />
          <circle cx="0" cy="0" r="4" fill={color} stroke="none" />
          <circle cx="72" cy="0" r="4" fill={color} stroke="none" />
          <circle cx="0" cy="72" r="4" fill={color} stroke="none" />
          <circle cx="72" cy="72" r="4" fill={color} stroke="none" />
        </g>
      );
    case "stripe":
      return (
        <g fill={color}>
          <rect x="10" y="0" width="2" height="72" opacity=".8" />
          <rect x="46" y="0" width="1" height="72" opacity=".6" />
        </g>
      );
    default:
      return null;
  }
}

export default function SareeArt({ art, className = "", label }: { art: Art; className?: string; label?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const body = "M70 120 L330 96 L352 400 L58 424 Z";
  const border = "M64 330 L344 306 L352 400 L58 424 Z";
  const pallu = "M70 120 L330 96 L332 128 L71 152 Z";

  return (
    <svg viewBox="0 0 400 480" className={className} role="img" aria-label={label ?? "Banarasi saree illustration"} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`m${id}`} width="72" height="72" patternUnits="userSpaceOnUse" patternTransform="rotate(-5)">
          <Motif motif={art.motif} color={art.accent} />
        </pattern>
        <pattern id={`b${id}`} width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(-5)">
          <path d="M14 2 26 14 14 26 2 14z" fill="none" stroke={art.accent} strokeWidth="1.5" />
          <circle cx="14" cy="14" r="3.5" fill={art.accent} />
        </pattern>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".18" />
          <stop offset=".6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
        <radialGradient id={`v${id}`} cx="50%" cy="45%" r="70%">
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".25" />
        </radialGradient>
        <clipPath id={`c${id}`}>
          <path d={body} />
        </clipPath>
      </defs>

      <rect width="400" height="480" fill={art.backdrop} />
      <rect width="400" height="480" fill={`url(#v${id})`} />
      <ellipse cx="208" cy="430" rx="170" ry="18" fill="#000" opacity=".22" />

      {/* stacked fold edges */}
      <path d="M330 96 L346 104 L368 408 L352 400 Z" fill={art.base} />
      <path d="M330 96 L346 104 L368 408 L352 400 Z" fill="#000" opacity=".3" />
      <path d="M58 424 L352 400 L368 408 L74 432 Z" fill={art.border} />
      <path d="M58 424 L352 400 L368 408 L74 432 Z" fill="#000" opacity=".25" />

      <g clipPath={`url(#c${id})`}>
        <path d={body} fill={art.base} />
        <rect x="0" y="0" width="400" height="480" fill={`url(#m${id})`} />
        <path d={pallu} fill={art.border} opacity=".9" />
        <path d={border} fill={art.border} />
        <path d={border} fill={`url(#b${id})`} opacity=".9" />
        <path d="M64 330 L344 306" stroke={art.accent} strokeWidth="3" />
        <path d="M62 344 L346 320" stroke={art.accent} strokeWidth="1" opacity=".8" />
        <path d="M60 408 L350 384" stroke={art.accent} strokeWidth="2" />
        <path d={body} fill={`url(#s${id})`} />
      </g>

      {/* jasmine sprig */}
      <g transform="translate(330 420)" opacity=".95">
        <path d="M0 0 C 10 -14 22 -20 36 -22" stroke="#5F7A3A" strokeWidth="1.5" fill="none" />
        {[0, 12, 24].map((x, i) => (
          <g key={i} transform={`translate(${x + 6} ${-8 - i * 5})`} fill="#FFFDF5">
            <circle r="3" cx="0" cy="-3" />
            <circle r="3" cx="3" cy="0" />
            <circle r="3" cx="0" cy="3" />
            <circle r="3" cx="-3" cy="0" />
            <circle r="1.5" fill="#F2C766" />
          </g>
        ))}
      </g>
    </svg>
  );
}
