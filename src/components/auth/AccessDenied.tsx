import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock, AlertTriangle, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AccessDeniedProps {
  requiredRole?: string | string[];
  customMessage?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole = 'ADMIN',
  customMessage
}) => {
  const navigate = useNavigate();
  const { user, switchAccount } = useAuth();

  const formattedRequiredRole = Array.isArray(requiredRole)
    ? requiredRole.map(r => r.replace('_', ' ')).join(' OR ')
    : requiredRole.replace('_', ' ');

  const formattedUserRole = user?.role ? user.role.replace('_', ' ') : 'UNAUTHENTICATED';

  return (
    <div
      className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6 bg-[#060913]"
      id="access-denied-view"
    >
      <div className="w-full max-w-xl rounded-xl border border-red-900/60 bg-[#0a0f1d] p-8 shadow-2xl shadow-red-950/40 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Security Header Banner */}
        <div className="flex items-center space-x-3 pb-6 border-b border-red-900/30">
          <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400 shadow-inner">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 uppercase">
                SECURITY VIOLATION 403
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                AUDIT_REF: SEC-{Date.now().toString().slice(-6)}
              </span>
            </div>
            <h1 className="text-xl font-bold font-mono tracking-wider text-red-200 mt-1 uppercase">
              ACCESS DENIED
            </h1>
            <p className="text-xs font-mono text-red-400/90 tracking-wide uppercase">
              INSUFFICIENT CLEARANCE LEVEL
            </p>
          </div>
        </div>

        {/* Clearance Level Comparison */}
        <div className="mt-6 p-4 rounded-lg bg-black/40 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Required Role:</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 font-bold border border-amber-700/50 uppercase tracking-wider">
              {formattedRequiredRole}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono border-t border-slate-800/60 pt-2.5">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Your Role:</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 font-bold border border-slate-700 uppercase tracking-wider">
              {formattedUserRole}
            </span>
          </div>
        </div>

        {/* Descriptive Notice */}
        <div className="mt-6 space-y-2">
          <p className="text-sm text-slate-300 leading-relaxed">
            {customMessage ||
              'This forensic intelligence partition requires elevated administrative clearance. Access attempts are hashed and permanently committed to the cryptographic audit trail.'}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Contact your organization administrator to request role elevation.
          </p>
        </div>

        {/* Quick Account Switcher for Demo Evaluation */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[11px] font-mono text-slate-400 mb-2">
            Switch to an authorized role to preview this module:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => switchAccount('ADMIN')}
              className={`px-2 py-1.5 rounded border text-[11px] font-mono transition-all ${
                user?.role === 'ADMIN'
                  ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-bold'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
              }`}
            >
              ADMIN
            </button>
            <button
              onClick={() => switchAccount('SENIOR_ANALYST')}
              className={`px-2 py-1.5 rounded border text-[11px] font-mono transition-all ${
                user?.role === 'SENIOR_ANALYST'
                  ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-bold'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
              }`}
            >
              SR. ANALYST
            </button>
            <button
              onClick={() => switchAccount('ANALYST')}
              className={`px-2 py-1.5 rounded border text-[11px] font-mono transition-all ${
                user?.role === 'ANALYST'
                  ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-bold'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
              }`}
            >
              ANALYST
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-5 flex items-center justify-between border-t border-slate-800/80">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-lg shadow-red-950/60 hover:scale-[1.02]"
            id="return-to-dashboard-btn"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
