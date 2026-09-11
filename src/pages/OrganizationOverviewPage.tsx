import React from 'react';
import {
  Building2,
  ShieldCheck,
  Server,
  Users,
  Award,
  HardDrive,
  Lock
} from 'lucide-react';

export const OrganizationOverviewPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono text-xs" id="org-overview-container">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <span className="text-cyan-400 font-semibold tracking-wider uppercase">
          Enterprise Governance
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
          Organization & Node Infrastructure Overview
        </h1>
        <p className="text-slate-400 mt-1">
          TRACE-X Enterprise tier deployment specifications and node cluster diagnostics
        </p>
      </div>

      {/* Top Organization Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Veritas Global Intelligence & Forensics LLC
              </h2>
              <p className="text-slate-400 text-[11px]">
                Organization ID: ORG-8821-VGI • License: Enterprise Tier (Unlimited Nodes)
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold self-start sm:self-auto">
            ENTERPRISE ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Jurisdiction</span>
            <p className="text-sm font-bold text-white mt-0.5">Geneva / New York</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Active Seat Allocation</span>
            <p className="text-sm font-bold text-cyan-400 mt-0.5">14 / 25 Analysts</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Security Clearance</span>
            <p className="text-sm font-bold text-purple-400 mt-0.5">Level 4 Fed/Interpol</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Audit Compliance</span>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">SOC2 Type II / ISO 27001</p>
          </div>
        </div>
      </div>

      {/* Cluster Nodes & Compute Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold text-white">Ethereum Archive Node</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-emerald-400 font-bold">ONLINE (Block 20,491,200)</p>
          <p className="text-slate-400 text-[11px]">Latency: 14ms • Full state sync verified</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold text-white">Polygon Bor / Heimdall</span>
            <Server className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-emerald-400 font-bold">ONLINE (Block 61,048,220)</p>
          <p className="text-slate-400 text-[11px]">Latency: 22ms • Checkpoint verification OK</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold text-white">Bitcoin Electrum Bridge</span>
            <Server className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-emerald-400 font-bold">ONLINE (Block 859,102)</p>
          <p className="text-slate-400 text-[11px]">Latency: 35ms • UTXO indexing active</p>
        </div>
      </div>
    </div>
  );
};
