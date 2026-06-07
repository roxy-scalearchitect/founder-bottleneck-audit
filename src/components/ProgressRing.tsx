interface ProgressRingProps {
  /** 0..1 fraction remaining (1 = full ring). */
  progress: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}

/**
 * Circular round-timer ring that depletes as the round runs. The arc is drawn
 * with stroke-dashoffset; a soft glow filter gives it the ember feel.
 */
export default function ProgressRing({
  progress,
  size = 280,
  stroke = 12,
  children,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - clamped);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A18" />
            <stop offset="60%" stopColor="#FF3B30" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3D1418"
          strokeWidth={stroke}
        />
        {/* Depleting arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#ringGlow)"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
