// Illustrated Varanasi ghats at sunset for the hero. Replace with a photograph by
// dropping public/hero.jpg in and switching the hero to an <img>.

const buildings: [number, number, number][] = [
  [0, 70, 120], [60, 50, 150], [100, 80, 110], [170, 40, 170], [205, 70, 130], [265, 55, 160], [315, 90, 120],
  [400, 45, 175], [440, 70, 135], [505, 60, 150], [560, 80, 115], [635, 50, 165], [680, 75, 125], [750, 55, 150],
  [800, 85, 120], [880, 45, 170], [920, 70, 130], [985, 60, 145], [1040, 80, 120], [1115, 55, 160], [1165, 70, 125],
  [1230, 60, 150], [1285, 80, 118], [1360, 40, 165],
];

const temples = [190, 420, 655, 900, 1135];

export default function GhatScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1400 700" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7A3A2A" />
          <stop offset=".45" stopColor="#D9782E" />
          <stop offset=".75" stopColor="#F4B25A" />
          <stop offset="1" stopColor="#F7C978" />
        </linearGradient>
        <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E89A45" />
          <stop offset="1" stopColor="#7A3E1E" />
        </linearGradient>
        <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE3A3" stopOpacity=".95" />
          <stop offset="1" stopColor="#FFE3A3" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="haze" cx="78%" cy="58%" r="45%">
          <stop offset="0" stopColor="#FFE9B0" stopOpacity=".8" />
          <stop offset="1" stopColor="#FFE9B0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1400" height="700" fill="url(#sky)" />
      <rect width="1400" height="700" fill="url(#haze)" />
      <circle cx="1090" cy="400" r="44" fill="#FFE7A8" opacity=".95" />

      {/* far ghats */}
      <g fill="#8A4A30" opacity=".75">
        {buildings.map(([x, w, h], i) => (
          <rect key={i} x={x} y={380 - h * 0.9} width={w} height={h * 0.9 + 30} />
        ))}
        {temples.map((x) => (
          <path key={x} d={`M${x} 250 l18 -70 l18 70 z M${x + 14} 180 v-14`} stroke="#8A4A30" strokeWidth="3" />
        ))}
      </g>
      <g fill="#6B3424" opacity=".55">
        {buildings.map(([x, w, h], i) =>
          Array.from({ length: Math.floor(h / 40) }).map((_, r) => (
            <rect key={`${i}-${r}`} x={x + 10} y={380 - h * 0.9 + 18 + r * 36} width={Math.max(6, w / 5)} height="12" />
          )),
        )}
      </g>

      {/* steps */}
      <g fill="#7A4030">
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x="0" y={400 + i * 6} width="1400" height="3" opacity={0.5 - i * 0.06} />
        ))}
      </g>

      {/* river */}
      <rect y="430" width="1400" height="270" fill="url(#river)" />
      <rect x="1060" y="440" width="60" height="260" fill="url(#glow)" />
      <g stroke="#FFD58A" strokeWidth="2" opacity=".5">
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={i} x1={1040 + ((i * 37) % 90)} x2={1080 + ((i * 37) % 90)} y1={460 + i * 16} y2={460 + i * 16} />
        ))}
      </g>

      {/* boats */}
      <g fill="#3A1D14">
        <path d="M600 530 h170 l-22 22 h-126 z" />
        <g>
          {[620, 650, 680, 710, 735].map((x) => (
            <path key={x} d={`M${x} 530 v-22 a7 7 0 1 1 10 0 v22z`} />
          ))}
        </g>
        <path d="M880 470 h120 l-16 16 h-88 z" opacity=".85" />
        <rect x="895" y="448" width="90" height="22" opacity=".85" />
        <path d="M430 495 h80 l-10 10 h-60 z" opacity=".75" />
        <path d="M1200 480 h70 l-9 9 h-52 z" opacity=".7" />
        <path d="M1290 452 h50 l-6 6 h-38 z" opacity=".6" />
      </g>
    </svg>
  );
}
