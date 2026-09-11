import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Activity,
  ShieldCheck,
  ChevronDown,
  User,
  LogOut,
  Sparkles,
  ExternalLink,
  Zap,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

interface TopBarProps {
  onSearchSelectWallet?: (wallet: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSearchSelectWallet }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [network, setNetwork] = useState('Ethereum');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false);
  const { user, logout, switchAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Breadcrumbs title from pathname
  const getBreadcrumbs = () => {
    const p = location.pathname;
    if (p === '/') return 'Overview';
    if (p === '/dashboard') return 'Intelligence Dashboard';
    if (p.startsWith('/investigations')) return 'Investigation Workspace';
    if (p.startsWith('/cases')) return 'Active Forensic Cases';
    if (p.startsWith('/transaction-analysis')) return 'Cryptographic Transactions';
    if (p.startsWith('/wallet-intelligence')) return 'Wallet Intelligence & Archetypes';
    if (p.startsWith('/fraud-detection')) return 'Fraud Pattern Detection';
    if (p.startsWith('/money-flow')) return 'Visual Money Flow Engine';
    if (p.startsWith('/vasp-attribution')) return 'Entity & VASP Attribution Registry';
    if (p.startsWith('/cross-chain')) return 'Cross-Chain Bridge Analytics';
    if (p.startsWith('/ai-intelligence')) return 'AI Forensic Research Dossier';
    if (p.startsWith('/datasets')) return 'Dataset Ingestion & Validation';
    if (p.startsWith('/reports')) return 'Forensic Dossier Reports';
    if (p.startsWith('/watchlist')) return 'Address Watchlist & Surveillance';
    if (p.startsWith('/alerts')) return 'Threat Alert Management';
    if (p.startsWith('/diagnostics')) return 'Platform Health & Diagnostic Telemetry';
    if (p.startsWith('/settings')) return 'System Configuration';
    if (p.startsWith('/admin')) return 'Enterprise Organization Suite';
    return 'Workspace';
  };

  const networks = ['Ethereum', 'Bitcoin', 'Polygon', 'BNB Chain', 'Solana'];

  return (
    <>
      <header
        className="h-14 border-b border-slate-800 bg-[#090d18]/90 backdrop-blur-md px-4 flex items-center justify-between z-20 select-none"
        id="trace-x-topbar"
      >
        {/* Left: Breadcrumbs */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">TRACE-X</span>
          <span className="text-slate-400 text-xs">/</span>
          <span className="text-xs font-semibold text-slate-200 tracking-wide">
            {getBreadcrumbs()}
          </span>
        </div>

        {/* Center: Command Palette Global Search Trigger */}
        <div className="flex-1 max-w-lg mx-6 hidden md:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 text-xs font-mono transition-all group shadow-inner"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span>Search wallet, transaction, entity or case...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          {/* Network Selector */}
          <div className="relative hidden sm:block">
            <select
              value={network}
              onChange={e => setNetwork(e.target.value)}
              className="appearance-none bg-slate-900/80 border border-slate-700/80 hover:border-slate-600 rounded-lg px-2.5 py-1 pr-7 text-xs font-mono font-medium text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {networks.map(net => (
                <option key={net} value={net}>
                  {net} Mainnet
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* System Telemetry Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-emerald-900/40 bg-emerald-950/20 text-[11px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operational (14ms)</span>
          </div>

          {/* Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setAlertsDropdownOpen(!alertsDropdownOpen)}
              className="relative p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#090d18]" />
            </button>

            {/* Alerts Quick Dropdown */}
            {alertsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-700 bg-[#0d1322] shadow-2xl p-3 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    Security Triage Alerts
                  </span>
                  <button
                    onClick={() => {
                      setAlertsDropdownOpen(false);
                      navigate('/alerts');
                    }}
                    className="text-[10px] font-mono text-cyan-400 hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="py-2 space-y-2">
                  <div className="p-2 rounded bg-red-950/30 border border-red-800/40 text-xs">
                    <p className="font-semibold text-red-300">Rapid Fund Movement</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      40.5 ETH forwarded in 14 minutes from DEMO_WALLET_001
                    </p>
                  </div>
                  <div className="p-2 rounded bg-amber-950/30 border border-amber-800/40 text-xs">
                    <p className="font-semibold text-amber-300">Mixer Interaction Flagged</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Deposit detected into Sigma Mixer protocol
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 pl-2 pr-1 py-1 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 transition-all text-left"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[11px] font-bold text-cyan-400">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[100px] truncate">
                {user?.name || 'Analyst'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile / Demo Role Switcher Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-700 bg-[#0d1322] shadow-2xl p-3 z-50 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-slate-800">
                  <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] font-mono text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 uppercase">
                    Role: {user?.role ? user.role.replace(/_/g, ' ') : 'INVESTIGATOR'}
                  </span>
                </div>

                {/* 1-Click Role Switcher for instant evaluation */}
                <div className="py-2.5 border-b border-slate-800">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Demo Role Switcher (RBAC)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                    <button
                      onClick={() => {
                        switchAccount('ADMIN');
                        setProfileDropdownOpen(false);
                      }}
                      className={`p-1.5 rounded border text-left flex items-center justify-between ${
                        user?.role === 'ADMIN'
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                          : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>Admin</span>
                      {user?.role === 'ADMIN' && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>

                    <button
                      onClick={() => {
                        switchAccount('SENIOR_ANALYST');
                        setProfileDropdownOpen(false);
                      }}
                      className={`p-1.5 rounded border text-left flex items-center justify-between ${
                        user?.role === 'SENIOR_ANALYST'
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                          : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>Sr. Analyst</span>
                      {user?.role === 'SENIOR_ANALYST' && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>

                    <button
                      onClick={() => {
                        switchAccount('ANALYST');
                        setProfileDropdownOpen(false);
                      }}
                      className={`p-1.5 rounded border text-left flex items-center justify-between ${
                        user?.role === 'ANALYST'
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                          : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>Analyst</span>
                      {user?.role === 'ANALYST' && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>

                    <button
                      onClick={() => {
                        switchAccount('PERSONAL_INVESTIGATOR');
                        setProfileDropdownOpen(false);
                      }}
                      className={`p-1.5 rounded border text-left flex items-center justify-between ${
                        user?.role === 'PERSONAL_INVESTIGATOR'
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                          : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>Personal</span>
                      {user?.role === 'PERSONAL_INVESTIGATOR' && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center space-x-2 px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-slate-800 text-left"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Profile & Keys</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center space-x-2 px-2 py-1.5 rounded text-xs text-red-400 hover:bg-red-950/40 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectWallet={onSearchSelectWallet}
      />
    </>
  );
};
