import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'case' | 'transaction' | 'alert';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'case' }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  if (normalized === 'UNDER_INVESTIGATION' || normalized === 'INVESTIGATING') {
    style = 'bg-cyan-950/60 text-cyan-400 border-cyan-800/60';
  } else if (normalized === 'CRITICAL' || normalized === 'FAILED' || normalized === 'UNREAD') {
    style = 'bg-red-950/60 text-red-400 border-red-800/60';
  } else if (normalized === 'RESOLVED' || normalized === 'CONFIRMED' || normalized === 'READ' || normalized === 'FINALIZED') {
    style = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
  } else if (normalized === 'MONITORING' || normalized === 'PENDING' || normalized === 'ACTIVE') {
    style = 'bg-amber-950/60 text-amber-400 border-amber-800/60';
  } else if (normalized === 'ARCHIVED' || normalized === 'DISMISSED' || normalized === 'PAUSED') {
    style = 'bg-slate-900 text-slate-500 border-slate-800';
  }

  const label = status.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center text-[11px] font-mono font-medium px-2 py-0.5 rounded border uppercase tracking-wide ${style}`}>
      {label}
    </span>
  );
};
