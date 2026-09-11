import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Flame,
  ArrowRight,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { EntityRecord } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

export const VaspAttributionPage: React.FC = () => {
  const [entities, setEntities] = useState<EntityRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.getEntities().then(data => {
      setEntities(data);
      setLoading(false);
    });
  }, []);

  const filtered = entities.filter(e => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter ? e.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" id="vasp-attribution-container">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
          Entity Directory
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
          VASP & Cryptocurrency Entity Attribution Registry
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Catalog of institutional VASPs, centralized exchanges, privacy pools, and cross-chain gateways
        </p>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search entity name, category or jurisdiction..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-slate-300 focus:outline-none cursor-pointer w-full sm:w-auto"
        >
          <option value="">All Categories</option>
          <option value="exchange">Centralized Exchange (CEX)</option>
          <option value="vasp">VASP</option>
          <option value="bridge">Cross-Chain Bridge</option>
          <option value="mixer">Anonymizer / Mixer</option>
          <option value="protocol">DeFi Protocol</option>
        </select>
      </div>

      {/* Entity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(entity => (
          <div
            key={entity.id}
            className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-lg border ${
                    entity.type === 'mixer'
                      ? 'bg-red-950/60 border-red-800/60 text-red-400'
                      : entity.type === 'bridge'
                      ? 'bg-purple-950/60 border-purple-800/60 text-purple-400'
                      : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                  }`}>
                    {entity.type === 'mixer' ? (
                      <Flame className="w-5 h-5" />
                    ) : entity.type === 'bridge' ? (
                      <Globe className="w-5 h-5" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                      {entity.name}
                      {entity.verified && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Category: {entity.category}
                    </p>
                  </div>
                </div>
                <RiskBadge category={entity.riskLevel} size="sm" />
              </div>

              <div className="space-y-1 text-xs font-mono border-t border-slate-800/60 pt-2.5">
                <div className="flex justify-between text-slate-400">
                  <span>Jurisdiction:</span>
                  <span className="text-slate-200">{entity.jurisdiction}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Confidence:</span>
                  <span className="text-cyan-400 font-semibold">{entity.confidence}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Observed Volume:</span>
                  <span className="text-white font-bold">{entity.volumeObserved}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-mono leading-relaxed pt-1">
                {entity.notes}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">
                {entity.addresses.length} Monitored Addresses
              </span>
              <button
                onClick={() => navigate(`/investigations?wallet=${encodeURIComponent(entity.addresses[0] || 'DEMO_WALLET_001')}`)}
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                Inspect <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
