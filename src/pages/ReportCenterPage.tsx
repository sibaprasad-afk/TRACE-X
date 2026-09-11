import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Printer,
  Download,
  Share2,
  Trash2,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { ReportDossier } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

export const ReportCenterPage: React.FC = () => {
  const { id: reportId } = useParams<{ id: string }>();
  const [reports, setReports] = useState<ReportDossier[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportDossier | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReports(data);
      if (reportId) {
        const found = data.find(r => r.id === reportId);
        if (found) setSelectedReport(found);
        else if (data.length > 0) setSelectedReport(data[0]);
      } else if (data.length > 0) {
        setSelectedReport(data[0]);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [reportId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!selectedReport) return;
    const blob = new Blob([JSON.stringify(selectedReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport.reportNumber}_dossier.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateNew = async () => {
    const wallet = prompt('Enter cryptocurrency wallet address for dossier compilation:', 'DEMO_WALLET_001');
    if (!wallet) return;

    try {
      const rep = await api.createReport({
        subjectWallet: wallet.trim(),
        network: 'Ethereum',
        caseName: `Forensic Probe on ${(wallet || '').trim().substring(0, 10)}...`
      });
      setReports(prev => [rep, ...prev]);
      setSelectedReport(rep);
    } catch (err: any) {
      alert(err.message || 'Failed to create report');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto print:p-0 print:bg-white print:text-black" id="report-center-container">
      {/* Top Header - hidden during print */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
            Legal & Regulatory Dossiers
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Forensic Intelligence Report Center
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Courtroom-ready evidentiary dossiers, regulatory SAR summaries, and law enforcement handoffs
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateNew}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs tracking-wider transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>GENERATE NEW DOSSIER</span>
          </button>
        </div>
      </div>

      {/* Main Layout: List on Left (hidden in print) and Full Dossier Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left List of reports */}
        <div className="lg:col-span-1 space-y-3 print:hidden">
          <div className="p-3 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Dossier Archives</span>
            <span>{reports.length} Reports</span>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {reports.map(rep => (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer font-mono text-xs space-y-2 ${
                  selectedReport?.id === rep.id
                    ? 'border-cyan-500 bg-cyan-950/30 text-white shadow-lg'
                    : 'border-slate-800 bg-[#090e1a]/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400">
                    {rep.reportNumber}
                  </span>
                  <RiskBadge score={rep.riskScore} size="sm" />
                </div>
                <p className="text-[11px] text-slate-300 font-semibold truncate">
                  {rep.caseName}
                </p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  <span className="text-emerald-400">{rep.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Dossier Preview Card */}
        <div className="lg:col-span-3">
          {selectedReport ? (
            <div className="p-8 rounded-2xl border border-slate-800 bg-[#090e1a] print:border-none print:bg-white print:p-4 text-slate-100 print:text-black space-y-6 shadow-2xl font-mono text-xs">
              {/* Dossier Header Actions - hidden in print */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 print:border-black pb-4 gap-3 print:hidden">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-cyan-400">
                    {selectedReport.reportNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                    {selectedReport.status}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                  </button>

                  <button
                    onClick={handleExportJson}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>

              {/* Courtroom / Institutional Title Banner */}
              <div className="border-b-2 border-slate-700 print:border-black pb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold tracking-widest text-cyan-400 print:text-black uppercase">
                    TRACE-X FORENSIC INTELLIGENCE DIVISION
                  </span>
                  <span className="text-[10px] text-slate-400 print:text-black">
                    CONFIDENTIAL EVIDENCE DOSSIER
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white print:text-black tracking-wide">
                  {selectedReport.caseName}
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] pt-3 text-slate-400 print:text-black">
                  <div>
                    <span>Subject Address:</span>
                    <p className="font-bold text-white print:text-black truncate">{selectedReport.subjectWallet}</p>
                  </div>
                  <div>
                    <span>Network / Protocol:</span>
                    <p className="font-bold text-white print:text-black">{selectedReport.network}</p>
                  </div>
                  <div>
                    <span>Risk Classification:</span>
                    <p className="font-bold text-red-400 print:text-black">{selectedReport.riskScore} / 100 ({selectedReport.riskCategory})</p>
                  </div>
                  <div>
                    <span>Authorized Analyst:</span>
                    <p className="font-bold text-white print:text-black">{selectedReport.authorName}</p>
                  </div>
                </div>
              </div>

              {/* Section 1: Executive Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 print:border-black pb-1">
                  1. Executive Summary & Purpose
                </h3>
                <p className="leading-relaxed text-slate-300 print:text-black p-3 rounded bg-slate-950/40 print:bg-transparent">
                  {selectedReport.executiveSummary}
                </p>
              </div>

              {/* Section 2: Key Findings */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 print:border-black pb-1">
                  2. Evidentiary Findings
                </h3>
                <div className="space-y-1.5">
                  {selectedReport.keyFindings?.map((kf, i) => (
                    <div key={i} className="flex items-start space-x-2 text-slate-300 print:text-black">
                      <span className="text-cyan-400 print:text-black font-bold">•</span>
                      <span className="leading-relaxed">{kf}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Behavioral Assessment & Fund Flows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 print:border-black pb-1">
                    3. Behavioral Assessment
                  </h3>
                  <p className="leading-relaxed text-slate-300 print:text-black p-3 rounded bg-slate-950/40 print:bg-transparent">
                    {selectedReport.behavioralAssessment}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 print:border-black pb-1">
                    4. Fund Flow & Dispersion
                  </h3>
                  <p className="leading-relaxed text-slate-300 print:text-black p-3 rounded bg-slate-950/40 print:bg-transparent">
                    {selectedReport.fundFlowSummary}
                  </p>
                </div>
              </div>

              {/* Section 4: Recommended Next Steps */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-black border-b border-slate-800 print:border-black pb-1">
                  5. Actionable Analytical Recommendations
                </h3>
                <div className="space-y-1.5">
                  {selectedReport.recommendedSteps?.map((step, i) => (
                    <div key={i} className="flex items-start space-x-2 text-emerald-300 print:text-black">
                      <span className="text-emerald-400 print:text-black font-bold">✓</span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Forensic Verification Signature */}
              <div className="pt-6 border-t-2 border-slate-800 print:border-black flex items-center justify-between text-[11px] text-slate-400 print:text-black">
                <div>
                  <p>Certified by: {selectedReport.authorName}</p>
                  <p>{selectedReport.authorRole}</p>
                </div>
                <div className="text-right">
                  <p>Report Date: {new Date(selectedReport.createdAt).toUTCString()}</p>
                  <p className="text-cyan-400 print:text-black">Status: FINALIZED & IMMUTABLE</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-2xl bg-[#090e1a]">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No Dossier Selected</p>
              <p className="text-xs text-slate-500 mt-1">Select an archive dossier from the left or generate a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
