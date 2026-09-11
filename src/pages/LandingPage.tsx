import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Check,
  ArrowRight,
  Shield,
  Activity,
  Search,
  ExternalLink
} from 'lucide-react';
import { ParticleSphereCanvas } from '../components/fienl/ParticleSphereCanvas';
import { ContourWaveArt } from '../components/fienl/ContourWaveArt';
import { InvestigationTraceModal } from '../components/fienl/InvestigationTraceModal';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTracePreset, setSelectedTracePreset] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number | null>(0); // 0 = TRACE expanded by default

  const openTraceModal = (presetAddress = '') => {
    setSelectedTracePreset(presetAddress);
    setModalOpen(true);
  };

  const tickerItems = [
    { label: 'SOLANA', status: 'LIVE', live: true },
    { label: 'TON', status: 'SOON', live: false },
    { label: 'BNB CHAIN', status: 'SOON', live: false },
    { label: 'POLYGON', status: 'LIVE', live: true },
    { label: 'ARBITRUM', status: 'LIVE', live: true },
    { label: 'TRON', status: 'LIVE', live: true },
    { label: 'ETHEREUM', status: 'LIVE', live: true },
    { label: 'BITCOIN', status: 'LIVE', live: true }
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-[#ececee] font-sans antialiased selection:bg-white selection:text-black overflow-x-hidden">
      {/* Interactive Trace Modal */}
      <InvestigationTraceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialAddress={selectedTracePreset}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-[#050507]/90 backdrop-blur-md border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left Nav */}
          <div className="flex items-center space-x-8">
            <a
              href="#method"
              className="text-[11px] font-mono tracking-widest text-neutral-400 hover:text-white transition-colors uppercase"
            >
              METHOD
            </a>
            <a
              href="#access"
              className="text-[11px] font-mono tracking-widest text-neutral-400 hover:text-white transition-colors uppercase"
            >
              ACCESS
            </a>
          </div>

          {/* Center Brand */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <span className="text-white text-lg font-light group-hover:rotate-45 transition-transform duration-300">
              ✳
            </span>
            <span className="text-sm font-mono tracking-[0.35em] text-white font-semibold">
              TRACE X
            </span>
          </div>

          {/* Right Action */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="text-[11px] font-mono tracking-widest text-neutral-300 hover:text-white uppercase transition-colors cursor-pointer"
              id="landing-nav-signin-btn"
            >
              SIGN IN
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[82vh] flex flex-col items-center justify-center pt-8 pb-16 px-6 overflow-hidden">
        {/* Background 3D Particle Sphere */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <ParticleSphereCanvas className="w-full h-full max-w-5xl max-h-[720px]" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center pointer-events-none mt-6">
          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-medium tracking-tight text-white uppercase select-none leading-none">
            FOLLOW THE MONEY
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-sm sm:text-base md:text-lg text-neutral-300/90 max-w-2xl mx-auto leading-relaxed font-normal tracking-wide">
            Paste any wallet. Trace X traces the funds across chains, flags mixers, sanctions and leakages, and hands you a written investigation — the final verdict in seconds.
          </p>

          {/* Call to Action Controls */}
          <div className="mt-10 flex flex-col items-center justify-center space-y-3 pointer-events-auto">
            <button
              onClick={() => openTraceModal()}
              className="px-8 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-mono font-semibold tracking-wider uppercase transition-all shadow-xl shadow-white/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              START AN INVESTIGATION
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('dossier');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else openTraceModal('TX9_Qf1v_TRON_MIXER_CASE');
              }}
              className="text-xs font-mono text-neutral-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer pt-1"
            >
              or see a live trace
            </button>
          </div>
        </div>
      </section>

      {/* Chain Status Ticker (Marquee) */}
      <div className="w-full border-y border-white/[0.08] bg-[#070709] py-3.5 overflow-hidden">
        <div className="flex w-max animate-marquee space-x-12 select-none">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase">
              <span className={item.live ? 'text-neutral-300 font-medium' : 'text-neutral-500'}>
                {item.label}
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                item.live ? 'text-emerald-400 font-semibold' : 'text-neutral-500'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics 3-Column Band */}
      <section className="border-b border-white/[0.08] bg-[#050507]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          <div className="py-12 px-8 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-mono font-medium text-white tracking-tight">
              8+
            </span>
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase mt-2">
              CHAINS, ONE ENGINE
            </span>
          </div>

          <div className="py-12 px-8 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-mono font-medium text-white tracking-tight">
              &lt; 30S
            </span>
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase mt-2">
              TO A VERDICT
            </span>
          </div>

          <div className="py-12 px-8 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-mono font-medium text-white tracking-tight">
              0-100
            </span>
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase mt-2">
              WEIGHTED RISK SCORE
            </span>
          </div>
        </div>
      </section>

      {/* Section: THE METHOD */}
      <section id="method" className="py-24 px-6 max-w-5xl mx-auto border-b border-white/[0.08]">
        <div className="mb-14">
          <div className="text-xs font-mono tracking-widest text-neutral-400 uppercase mb-3">
            THE METHOD
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight uppercase">
            HOW TRACE X READS A WALLET
          </h2>
        </div>

        {/* 3 Step Accordions */}
        <div className="border-t border-white/[0.1] divide-y divide-white/[0.08]">
          {/* Step 01 */}
          <div className="py-8">
            <div
              onClick={() => setActiveStep(activeStep === 0 ? null : 0)}
              className="flex items-start justify-between cursor-pointer group"
            >
              <div className="flex items-start space-x-6 sm:space-x-12">
                <span className="text-xs font-mono text-neutral-500 pt-1">01</span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-mono font-medium text-white group-hover:text-neutral-300 transition-colors uppercase">
                    TRACE
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-2xl font-sans leading-relaxed">
                    We walk the transaction graph outward from the address — every counterparty, every hop, aggregated into a live money-flow map.
                  </p>
                </div>
              </div>
              <div className="text-neutral-400 pt-1">
                {activeStep === 0 ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </div>

            {activeStep === 0 && (
              <div className="mt-6 ml-10 sm:ml-16 pl-2 border-l border-neutral-800 flex flex-wrap gap-4 text-xs font-mono text-neutral-400 tracking-wider">
                <span>• BFS TRAVERSAL, DEPTH-CONFIGURABLE</span>
                <span>• COUNTERPARTY AGGREGATION BY ENTITY</span>
                <span>• USDT + NATIVE TOKEN FLOWS, BOTH DIRECTIONS</span>
              </div>
            )}
          </div>

          {/* Step 02 */}
          <div className="py-8">
            <div
              onClick={() => setActiveStep(activeStep === 1 ? null : 1)}
              className="flex items-start justify-between cursor-pointer group"
            >
              <div className="flex items-start space-x-6 sm:space-x-12">
                <span className="text-xs font-mono text-neutral-500 pt-1">02</span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-mono font-medium text-white group-hover:text-neutral-300 transition-colors uppercase">
                    SCREEN
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-2xl font-sans leading-relaxed">
                    Each node is checked against open-source intelligence: OFAC sanctions, known mixers, scam and hack datasets. Risk is weighted by proximity.
                  </p>
                </div>
              </div>
              <div className="text-neutral-400 pt-1">
                {activeStep === 1 ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </div>

            {activeStep === 1 && (
              <div className="mt-6 ml-10 sm:ml-16 pl-2 border-l border-neutral-800 flex flex-wrap gap-4 text-xs font-mono text-neutral-400 tracking-wider">
                <span>• OFAC & SANCTIONS DATABASE AUDIT</span>
                <span>• KNOWN MIXERS & WASH PROTOCOLS</span>
                <span>• PROXIMITY EXPONENTIAL DECAY WEIGHTING</span>
              </div>
            )}
          </div>

          {/* Step 03 */}
          <div className="py-8">
            <div
              onClick={() => setActiveStep(activeStep === 2 ? null : 2)}
              className="flex items-start justify-between cursor-pointer group"
            >
              <div className="flex items-start space-x-6 sm:space-x-12">
                <span className="text-xs font-mono text-neutral-500 pt-1">03</span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-mono font-medium text-white group-hover:text-neutral-300 transition-colors uppercase">
                    VERDICT
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-2xl font-sans leading-relaxed">
                    An investigator writes the case in plain language — what the wallet did, where the risk sits, and a final, defensible verdict.
                  </p>
                </div>
              </div>
              <div className="text-neutral-400 pt-1">
                {activeStep === 2 ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </div>

            {activeStep === 2 && (
              <div className="mt-6 ml-10 sm:ml-16 pl-2 border-l border-neutral-800 flex flex-wrap gap-4 text-xs font-mono text-neutral-400 tracking-wider">
                <span>• DETERMINISTIC EXPLAINABLE SYNTHESIS</span>
                <span>• AUDITABLE GRAPH FOOTPRINTS</span>
                <span>• DEFENSIBLE FOR COMPLIANCE & COURT DISCLOSURE</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section: THE DOSSIER */}
      <section id="dossier" className="py-24 px-6 max-w-5xl mx-auto border-b border-white/[0.08]">
        <div className="mb-12">
          <div className="text-xs font-mono tracking-widest text-neutral-400 uppercase mb-3">
            THE DOSSIER
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight uppercase">
            NOT A SCORE. A STORY.
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 mt-4 max-w-3xl leading-relaxed font-sans">
            Every trace ends in a written verdict you can act on and share — the reasoning laid out, sourced from the graph, clear enough for a compliance officer or a court. Here are both endings: a flagged case, and a clean one traced live on Tron mainnet.
          </p>
        </div>

        {/* Dual Live Dossier Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: Flagged Case */}
          <div className="bg-[#09090c] border border-neutral-800/90 rounded-xl p-6 flex flex-col justify-between font-mono text-xs">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-5">
                <span className="text-neutral-400 tracking-wider">INVESTIGATION #4471</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] tracking-widest font-semibold">
                  FLAGGED
                </span>
              </div>

              {/* Metadata */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-500">SUBJECT</span>
                  <span className="text-white font-semibold">TX9_Qf1v</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">CHAIN</span>
                  <span className="text-neutral-300">TRON · USDT</span>
                </div>
              </div>

              {/* Risk Score */}
              <div className="border-t border-b border-neutral-800/80 py-4 mb-6">
                <div className="text-neutral-500 text-[11px] mb-1">RISK</div>
                <div className="text-4xl font-light text-white">65</div>
              </div>

              {/* Risk Breakdown */}
              <div className="space-y-2 mb-6">
                <div className="text-neutral-500 text-[11px] tracking-wider mb-2">RISK BREAKDOWN</div>
                <div className="flex justify-between text-neutral-400">
                  <span>SANCTIONS · 2 HOPS</span>
                  <span className="text-neutral-300 font-semibold">+40</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>MIXER · 1 HOPS</span>
                  <span className="text-neutral-300 font-semibold">+24</span>
                </div>
                <div className="flex justify-between text-neutral-300 pt-2 border-t border-neutral-800/60 font-semibold">
                  <span>TOTAL</span>
                  <span>84</span>
                </div>
              </div>
            </div>

            {/* Verdict Box */}
            <div className="bg-black/50 border border-neutral-800 rounded-lg p-4 font-mono text-[11px] text-neutral-300 leading-relaxed">
              <div className="text-neutral-500 mb-1">$ verdict</div>
              <p>
                Funds were laundered through a mixer, then settled on a sanctioned exchange. Exposure is direct and deliberate. Verdict: FLAGGED
              </p>
            </div>
          </div>

          {/* Card 2: Clean Case */}
          <div className="bg-[#09090c] border border-neutral-800/90 rounded-xl p-6 flex flex-col justify-between font-mono text-xs">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-5">
                <span className="text-neutral-400 tracking-wider">DOSSIER · TR7X_L24T · TRON</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] tracking-widest font-semibold">
                  CLEAN
                </span>
              </div>

              {/* Verdict header */}
              <div className="mb-4">
                <div className="text-neutral-500 text-[11px] mb-1">VERDICT</div>
                <div className="text-white font-semibold">CLEAN · SCORE: 0/100 · LOW</div>
              </div>

              {/* Risk Breakdown */}
              <div className="mb-5">
                <div className="text-neutral-500 text-[11px] mb-1">RISK BREAKDOWN</div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  No exposure to sanctioned entities, mixers, scams or darknet services detected within 2 hops.
                </p>
              </div>

              {/* Key Findings */}
              <div className="mb-5">
                <div className="text-neutral-500 text-[11px] mb-2">KEY FINDINGS</div>
                <ul className="space-y-1.5 text-neutral-400 text-[11px]">
                  <li>• 208 transfers analyzed</li>
                  <li>• 81 counterparties within 2 hops</li>
                  <li>• No flagged entities found</li>
                  <li>• 3 service wallets identified — risk not propagated through them</li>
                </ul>
              </div>
            </div>

            {/* Conclusion */}
            <div className="bg-black/50 border border-neutral-800 rounded-lg p-4 font-mono text-[11px] text-neutral-300 leading-relaxed">
              <div className="text-neutral-500 mb-1">CONCLUSION</div>
              <p>
                No risk was flagged across the observed flows. The wallet appears operationally clean based on currently available intelligence.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Feature Value Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-white/[0.08] mb-10">
          <div>
            <div className="flex items-center space-x-2 text-white font-mono text-xs font-semibold">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Money-flow graph</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 font-sans">
              82 nodes in the live trace, walked 2 hops out
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-white font-mono text-xs font-semibold">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Score with breakdown</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 font-sans">
              each point traceable to a named finding
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-white font-mono text-xs font-semibold">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Service detection</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 font-sans">
              exchange wallets never pollute your score
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-white font-mono text-xs font-semibold">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Deterministic dossier</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 font-sans">
              numbers from the graph, never from the model
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => openTraceModal()}
            className="px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-mono font-semibold tracking-wider uppercase transition-all shadow-md shadow-white/5 cursor-pointer"
          >
            RUN YOUR OWN TRACE
          </button>
        </div>
      </section>

      {/* Section: CAPABILITIES */}
      <section className="py-24 px-6 max-w-5xl mx-auto border-b border-white/[0.08]">
        <div className="mb-14">
          <div className="text-xs font-mono tracking-widest text-neutral-400 uppercase mb-3">
            CAPABILITIES
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight uppercase">
            BUILT FOR PEOPLE WHO NEED TO BE SURE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="border border-neutral-800/80 rounded-xl p-6 bg-[#08080a] hover:border-neutral-700 transition-colors">
            <h3 className="text-sm font-mono font-semibold text-white tracking-wider uppercase mb-3">
              TRON · USDT, LIVE TODAY
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Tracing runs on Tron mainnet right now. Ethereum, Bitcoin, Solana and more land on the same engine next.
            </p>
          </div>

          {/* Card 2 */}
          <div className="border border-neutral-800/80 rounded-xl p-6 bg-[#08080a] hover:border-neutral-700 transition-colors">
            <h3 className="text-sm font-mono font-semibold text-white tracking-wider uppercase mb-3">
              AI INVESTIGATOR
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              A model reads the graph and writes the case. It never invents an address — only reasons over the facts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="border border-neutral-800/80 rounded-xl p-6 bg-[#08080a] hover:border-neutral-700 transition-colors">
            <h3 className="text-sm font-mono font-semibold text-white tracking-wider uppercase mb-3">
              PROXIMITY-WEIGHTED RISK
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Direct contact with a mixer weighs more than five hops away. The score reflects real exposure, not noise.
            </p>
          </div>

          {/* Card 4 */}
          <div className="border border-neutral-800/80 rounded-xl p-6 bg-[#08080a] hover:border-neutral-700 transition-colors">
            <h3 className="text-sm font-mono font-semibold text-white tracking-wider uppercase mb-3">
              OPEN-SOURCE LABELS
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Sanctions, mixers, scam and hack datasets — transparent sourcing you can audit, not a locked black box.
            </p>
          </div>

          {/* Card 5 */}
          <div className="border border-neutral-800/80 rounded-xl p-6 bg-[#08080a] hover:border-neutral-700 transition-colors">
            <h3 className="text-sm font-mono font-semibold text-white tracking-wider uppercase mb-3">
              WALLET MONITORING
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Watch an address. Get alerted the moment it moves or touches something risky.
            </p>
          </div>

          {/* Card 6 */}
          <div className="border border-neutral-800/80 rounded-xl p-6 bg-[#08080a] hover:border-neutral-700 transition-colors">
            <h3 className="text-sm font-mono font-semibold text-white tracking-wider uppercase mb-3">
              SHAREABLE DOSSIER
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Export the verdict as a clean report or a shareable card — proof, not a screenshot.
            </p>
          </div>
        </div>
      </section>

      {/* Section: ACCESS (Pricing) */}
      <section id="access" className="py-24 px-6 max-w-6xl mx-auto border-b border-white/[0.08]">
        <div className="mb-14 text-center">
          <div className="text-xs font-mono tracking-widest text-neutral-400 uppercase mb-3">
            ACCESS
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight uppercase">
            START FREE. SCALE WHEN IT MATTERS.
          </h2>
        </div>

        {/* 4 Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Recon */}
          <div className="border border-neutral-800 rounded-xl p-6 bg-[#08080a] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono tracking-wider text-neutral-400 uppercase mb-2">
                RECON
              </div>
              <div className="text-3xl font-mono font-light text-white mb-1">
                FREE
              </div>
              <div className="text-xs text-neutral-500 mb-6 font-sans">
                Get started, no card.
              </div>

              <div className="space-y-3 border-t border-neutral-800/80 pt-6 text-xs font-mono text-neutral-300">
                <div>5 TRACES</div>
                <div>ALL 8 CHAINS</div>
                <div>2-HOP GRAPH</div>
                <div>RISK SCORE + VERDICT</div>
                <div>3 WATCHED ADDRESSES</div>
              </div>
            </div>

            <button
              onClick={() => openTraceModal()}
              className="mt-8 w-full py-2.5 rounded-lg border border-neutral-700 hover:border-white text-xs font-mono text-white transition-all uppercase"
            >
              GET STARTED
            </button>
          </div>

          {/* Investigator (Most Chosen) */}
          <div className="relative border border-neutral-600 rounded-xl p-6 bg-[#0c0c10] flex flex-col justify-between shadow-xl">
            <div className="absolute -top-3 right-4 px-2 py-0.5 rounded bg-white text-black text-[10px] font-mono font-semibold tracking-wider uppercase">
              MOST CHOSEN
            </div>

            <div>
              <div className="text-xs font-mono tracking-wider text-neutral-300 uppercase mb-2">
                INVESTIGATOR
              </div>
              <div className="text-3xl font-mono font-light text-white mb-1">
                $49/MO
              </div>
              <div className="text-xs text-neutral-400 mb-6 font-sans">
                Check wallets every day.
              </div>

              <div className="space-y-3 border-t border-neutral-800 pt-6 text-xs font-mono text-neutral-200">
                <div>100 TRACES / MONTH</div>
                <div>3-HOP DEEP GRAPHS</div>
                <div>50 WATCHED ADDRESSES</div>
                <div>LIVE MOVEMENT ALERTS</div>
                <div>PDF DOSSIERS</div>
              </div>
            </div>

            <button
              onClick={() => openTraceModal()}
              className="mt-8 w-full py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-xs font-mono font-semibold text-black transition-all uppercase"
            >
              GET ACCESS
            </button>
          </div>

          {/* Pro */}
          <div className="border border-neutral-800 rounded-xl p-6 bg-[#08080a] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono tracking-wider text-neutral-400 uppercase mb-2">
                PRO
              </div>
              <div className="text-3xl font-mono font-light text-white mb-1">
                $149/MO
              </div>
              <div className="text-xs text-neutral-500 mb-6 font-sans">
                For desks and analysts.
              </div>

              <div className="space-y-3 border-t border-neutral-800/80 pt-6 text-xs font-mono text-neutral-300">
                <div>400 TRACES / MONTH</div>
                <div>4-HOP INVESTIGATIONS</div>
                <div>250 WATCHED ADDRESSES</div>
                <div>PRIORITY ALERTS</div>
                <div>EVERYTHING IN INVESTIGATOR</div>
              </div>
            </div>

            <button
              onClick={() => openTraceModal()}
              className="mt-8 w-full py-2.5 rounded-lg border border-neutral-700 hover:border-white text-xs font-mono text-white transition-all uppercase"
            >
              GET ACCESS
            </button>
          </div>

          {/* Desk */}
          <div className="border border-neutral-800 rounded-xl p-6 bg-[#08080a] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono tracking-wider text-neutral-400 uppercase mb-2">
                DESK
              </div>
              <div className="text-3xl font-mono font-light text-white mb-1">
                CUSTOM
              </div>
              <div className="text-xs text-neutral-500 mb-6 font-sans">
                Compliance & integrations.
              </div>

              <div className="space-y-3 border-t border-neutral-800/80 pt-6 text-xs font-mono text-neutral-300">
                <div>UNLIMITED TRACES</div>
                <div>4-HOP INVESTIGATIONS</div>
                <div>REST API ACCESS</div>
                <div>CLIENT-BRANDED DOSSIERS</div>
                <div>PRIORITY SUPPORT</div>
              </div>
            </div>

            <button
              onClick={() => openTraceModal()}
              className="mt-8 w-full py-2.5 rounded-lg border border-neutral-700 hover:border-white text-xs font-mono text-white transition-all uppercase"
            >
              TALK TO US
            </button>
          </div>
        </div>

        <div className="text-center mt-10 text-xs font-mono text-neutral-500">
          Just checking one wallet? Every account starts with 5 free traces — no card.
        </div>
      </section>

      {/* Final Call To Action with Generative Contour Art */}
      <section className="relative py-28 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Generative Contour Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ContourWaveArt />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-light text-white tracking-tight uppercase leading-tight">
            THE FINAL WORD ON ANY WALLET
          </h2>

          <div className="mt-8">
            <button
              onClick={() => openTraceModal()}
              className="px-8 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-mono font-semibold tracking-wider uppercase transition-all shadow-xl shadow-white/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              CREATE YOUR ACCOUNT
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#040405] py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-neutral-500">
          <div className="flex items-center space-x-2">
            <span>✳</span>
            <span>INTELLIGENCE, NOT LEGAL ADVICE.</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#terms" className="hover:text-neutral-300 transition-colors">TERMS</a>
            <a href="#privacy" className="hover:text-neutral-300 transition-colors">PRIVACY</a>
            <a href="#contact" className="hover:text-neutral-300 transition-colors">CONTACT</a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-neutral-300 transition-colors">𝕏</a>
          </div>

          <div>
            © 2026 TRACE X · TRACEX.IO
          </div>
        </div>
      </footer>
    </div>
  );
};
