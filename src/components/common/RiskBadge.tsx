import React from 'react';

interface RiskBadgeProps {
  score?: number;
  category?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, category, size = 'md' }) => {
  let cat = category?.toUpperCase() || 'LOW';
  if (score !== undefined) {
    if (score >= 85) cat = 'CRITICAL';
    else if (score >= 70) cat = 'VERY_HIGH';
    else if (score >= 50) cat = 'HIGH';
    else if (score >= 25) cat = 'MEDIUM';
    else cat = 'LOW';
  }

  const styles = {
    CRITICAL: 'bg-red-950/60 text-red-400 border-red-800/60 shadow-red-950/20',
    VERY_HIGH: 'bg-orange-950/60 text-orange-400 border-orange-800/60 shadow-orange-950/20',
    HIGH: 'bg-amber-950/60 text-amber-400 border-amber-800/60 shadow-amber-950/20',
    MEDIUM: 'bg-blue-950/60 text-blue-400 border-blue-800/60 shadow-blue-950/20',
    LOW: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 shadow-emerald-950/20'
  }[cat] || 'bg-slate-900 text-slate-400 border-slate-700';

  const dotColors = {
    CRITICAL: 'bg-red-400 animate-pulse',
    VERY_HIGH: 'bg-orange-400',
    HIGH: 'bg-amber-400',
    MEDIUM: 'bg-blue-400',
    LOW: 'bg-emerald-400'
  }[cat] || 'bg-slate-400';

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold'
  }[size];

  const formattedName = cat.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border shadow-sm ${styles} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors}`} />
      {score !== undefined ? `${score} • ${formattedName}` : formattedName}
    </span>
  );
};
