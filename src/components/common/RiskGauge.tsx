import React from 'react';

interface RiskGaugeProps {
  score: number;
  category?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL' | string;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  category,
  size = 130,
  strokeWidth = 10,
  showLabel = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.min(100, Math.max(0, score));
  const dashOffset = circumference - (safeScore / 100) * circumference;

  let strokeColor = '#10b981'; // LOW: emerald
  let glowColor = 'rgba(16, 185, 129, 0.3)';
  let labelText = category || 'LOW';

  if (safeScore >= 85) {
    strokeColor = '#ef4444'; // CRITICAL: red
    glowColor = 'rgba(239, 68, 68, 0.4)';
    labelText = 'CRITICAL';
  } else if (safeScore >= 70) {
    strokeColor = '#f97316'; // VERY HIGH: orange
    glowColor = 'rgba(249, 115, 22, 0.35)';
    labelText = 'VERY HIGH';
  } else if (safeScore >= 50) {
    strokeColor = '#f59e0b'; // HIGH: amber
    glowColor = 'rgba(245, 158, 11, 0.3)';
    labelText = 'HIGH';
  } else if (safeScore >= 25) {
    strokeColor = '#3b82f6'; // MEDIUM: blue
    glowColor = 'rgba(59, 130, 246, 0.3)';
    labelText = 'MEDIUM';
  }

  return (
    <div className="relative inline-flex flex-col items-center justify-center select-none" id="risk-gauge-container">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Active colored arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 6px ${glowColor})`
          }}
        />
      </svg>

      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-mono text-2xl font-bold tracking-tight text-white">
          {safeScore}
        </span>
        <span className="text-[10px] font-semibold tracking-wider text-slate-400">
          / 100
        </span>
      </div>

      {showLabel && (
        <span
          className="mt-2 text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border"
          style={{
            color: strokeColor,
            borderColor: `${strokeColor}40`,
            backgroundColor: `${strokeColor}10`
          }}
        >
          {labelText}
        </span>
      )}
    </div>
  );
};
