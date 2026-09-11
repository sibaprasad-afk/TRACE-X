import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Search,
  Wallet,
  ShieldAlert,
  GitFork,
  Bot,
  Building2,
  Globe2,
  Database,
  FileText,
  Eye,
  Bell,
  Activity,
  Settings,
  Users,
  Briefcase,
  History,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isOrgAdmin = user?.role === 'ADMIN';
  const isSeniorAnalyst = user?.role === 'SENIOR_ANALYST';
  const isOrgUser = isOrgAdmin || isSeniorAnalyst;

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'INVESTIGATIONS',
      items: [
        { name: 'Workspace', path: '/investigations', icon: Search, badge: 'Live' },
        { name: 'Active Cases', path: '/cases', icon: FolderKanban }
      ]
    },
    {
      title: 'ANALYSIS',
      items: [
        { name: 'Transactions', path: '/transaction-analysis', icon: Activity },
        { name: 'Wallet Intelligence', path: '/wallet-intelligence', icon: Wallet },
        { name: 'Fraud Detection', path: '/fraud-detection', icon: ShieldAlert },
        { name: 'Money Flow', path: '/money-flow', icon: GitFork }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { name: 'AI Intelligence', path: '/ai-intelligence', icon: Bot, badge: 'AI' },
        { name: 'Entity / VASP', path: '/vasp-attribution', icon: Building2 },
        { name: 'Cross-Chain', path: '/cross-chain', icon: Globe2 }
      ]
    },
    {
      title: 'DATA',
      items: [
        { name: 'Datasets & CSV', path: '/datasets', icon: Database },
        { name: 'Report Center', path: '/reports', icon: FileText }
      ]
    },
    {
      title: 'MONITORING',
      items: [
        { name: 'Watchlist', path: '/watchlist', icon: Eye },
        { name: 'Alerts', path: '/alerts', icon: Bell, badge: '3' }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Diagnostics', path: '/diagnostics', icon: Zap },
        { name: 'Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  const orgGroup = {
    title: 'ORGANIZATION',
    items: [
      { name: 'Overview', path: '/admin/organization', icon: Briefcase },
      { name: 'Employees', path: '/admin/employees', icon: Users, adminOnly: true },
      { name: 'Case Assignment', path: '/admin/cases', icon: FolderKanban },
      { name: 'Analyst Activity', path: '/admin/activity', icon: Activity },
      { name: 'Audit Logs', path: '/admin/audit-logs', icon: History },
      { name: 'Org Settings', path: '/admin/settings', icon: Lock, adminOnly: true }
    ]
  };

  const visibleOrgItems = orgGroup.items.filter(item => {
    if (isOrgAdmin) return true;
    if (isSeniorAnalyst) return !item.adminOnly;
    return false;
  });

  return (
    <aside
      className={`relative flex flex-col bg-[#090d18] border-r border-slate-800 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      id="trace-x-sidebar"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/80 bg-slate-950/40">
        {!collapsed ? (
          <NavLink to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm tracking-tighter shadow-lg shadow-cyan-950/50 group-hover:border-cyan-400 transition-all">
              TX
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-extrabold text-sm tracking-wider text-white">
                  TRACE<span className="text-cyan-400">-X</span>
                </span>
                <span className="text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 px-1 py-0.2 rounded border border-cyan-800/50">
                  ENT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Forensic Intelligence
              </p>
            </div>
          </NavLink>
        ) : (
          <NavLink to="/" className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm shadow-md">
              TX
            </div>
          </NavLink>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </span>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    {!collapsed && (
                      <span className="flex-1 truncate tracking-wide">
                        {item.name}
                      </span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {/* Organization Management Section for Org Users */}
        {isOrgUser && visibleOrgItems.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            {!collapsed && (
              <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                <span>{orgGroup.title}</span>
                <span className="text-[8px] bg-cyan-950 px-1 py-0.5 rounded border border-cyan-800">
                  {isOrgAdmin ? 'ADMIN' : 'SR ANALYST'}
                </span>
              </span>
            )}
            <div className="space-y-0.5">
              {visibleOrgItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    {!collapsed && (
                      <span className="flex-1 truncate tracking-wide">
                        {item.name}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User Footer Profile Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {user?.name || 'Forensic Investigator'}
                </p>
                <p className="text-[10px] font-mono text-cyan-400 truncate">
                  {user?.role ? user.role.replace(/_/g, ' ') : 'ANALYST'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
        )}
      </div>
    </aside>
  );
};
