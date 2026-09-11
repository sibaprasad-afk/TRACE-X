import React, { useState } from 'react';
import {
  Upload,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { api } from '../services/api';

export const DatasetManagerPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [ingesting, setIngesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const sampleDatasets = [
    {
      id: 'DS-01',
      name: 'Synthesized Ethereum Laundering Mix (Sep 2026)',
      records: 1250,
      size: '1.4 MB',
      status: 'INDEXED',
      chains: 'Ethereum, Polygon'
    },
    {
      id: 'DS-02',
      name: 'Anonymizer & Transit Cluster 4-B',
      records: 480,
      size: '520 KB',
      status: 'INDEXED',
      chains: 'Ethereum, BNB Chain'
    },
    {
      id: 'DS-03',
      name: 'DeFi Flash-Drain Liquidity Sinks',
      records: 890,
      size: '980 KB',
      status: 'INDEXED',
      chains: 'Ethereum, Solana'
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      const rows = lines.slice(1, 6).map((line, i) => {
        const parts = line.split(',');
        return {
          id: i,
          txHash: parts[0] || `0x${Math.random().toString(16).substring(2, 10)}...`,
          from: parts[1] || `0x${Math.random().toString(16).substring(2, 8)}...`,
          to: parts[2] || `0x${Math.random().toString(16).substring(2, 8)}...`,
          amount: parts[3] || (Math.random() * 50).toFixed(2),
          asset: parts[4] || 'ETH'
        };
      });
      setParsedRows(rows);
    };
    reader.readAsText(file);
  };

  const handleIngest = async () => {
    if (!uploadedFile) return;
    setIngesting(true);
    try {
      await api.ingestDataset({
        datasetName: uploadedFile.name,
        recordCount: parsedRows.length > 0 ? parsedRows.length * 10 : 250
      });
      setSuccessMsg(`Successfully indexed ${uploadedFile.name} into the local TRACE-X in-memory database.`);
      setUploadedFile(null);
      setParsedRows([]);
    } catch (err: any) {
      alert(err.message || 'Ingestion failed');
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" id="dataset-manager-container">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
          Ledger Ingestion Pipeline
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
          Dataset Manager & Custom CSV Ingestion
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Ingest raw transaction records, blockchain dump files, or custom enterprise ledgers into TRACE-X
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/30 text-emerald-300 font-mono text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center font-mono ${
          dragActive
            ? 'border-cyan-400 bg-cyan-950/30'
            : 'border-slate-800 bg-[#090e1a]/80 hover:border-slate-700'
        }`}
      >
        <Upload className="w-10 h-10 mx-auto mb-3 text-cyan-400" />
        <h3 className="text-sm font-bold text-white uppercase">
          Drag & Drop CSV Transaction Ledger Files
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Supports standard blockchain dump formats (Hash, From, To, Value, Asset, Timestamp, Block)
        </p>

        <label className="mt-4 inline-block px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white cursor-pointer transition-all">
          Browse Computer Files
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* Parsed Preview Table */}
      {uploadedFile && (
        <div className="p-5 rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white">
                File Parsed: {uploadedFile.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                {(uploadedFile.size / 1024).toFixed(1)} KB • Previewing first 5 detected rows
              </p>
            </div>

            <button
              onClick={handleIngest}
              disabled={ingesting}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs tracking-wider transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{ingesting ? 'INGESTING...' : 'COMMIT & INGEST INTO DATABASE'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2">Hash</th>
                  <th className="pb-2">From</th>
                  <th className="pb-2">To</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Asset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {parsedRows.map((r, i) => (
                  <tr key={i} className="text-slate-300">
                    <td className="py-2 text-cyan-400">{r.txHash}</td>
                    <td className="py-2">{r.from}</td>
                    <td className="py-2">{r.to}</td>
                    <td className="py-2 font-bold text-white">{r.amount}</td>
                    <td className="py-2">{r.asset}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Datasets Catalog */}
      <div className="rounded-xl border border-slate-800 bg-[#090e1a]/80 backdrop-blur-sm overflow-hidden font-mono text-xs">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Active Forensic Datasets Loaded in Memory
          </h3>
          <span className="text-[11px] text-cyan-400">In-Memory Engine Ready</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4">Dataset ID</th>
                <th className="py-3 px-4">Dataset Title</th>
                <th className="py-3 px-4">Records Indexed</th>
                <th className="py-3 px-4">Storage Size</th>
                <th className="py-3 px-4">Chains</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {sampleDatasets.map(ds => (
                <tr key={ds.id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-cyan-400">{ds.id}</td>
                  <td className="py-3.5 px-4 text-white font-semibold">{ds.name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{ds.records.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-slate-400">{ds.size}</td>
                  <td className="py-3.5 px-4 text-slate-400">{ds.chains}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px]">
                      {ds.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
