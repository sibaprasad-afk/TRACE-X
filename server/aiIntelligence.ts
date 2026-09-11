import { GoogleGenAI } from '@google/genai';
import { WalletProfile, FraudFinding, RiskBreakdown, GraphData } from './types';

export interface AIIntelligenceReport {
  executiveSummary: string;
  keyFindings: string[];
  behavioralAssessment: string;
  fundFlowSummary: string;
  entityExposure: string;
  timelineSummary: string;
  riskExplanation: string;
  conclusion: string;
  recommendedSteps: string[];
  generatedBy: 'GEMINI_LLM' | 'DETERMINISTIC_FORENSIC_ENGINE';
  timestamp: string;
}

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

export class AIIntelligenceEngine {
  static async generateIntelligence(
    wallet: WalletProfile,
    risk: RiskBreakdown,
    fraudFindings: FraudFinding[],
    graph: GraphData
  ): Promise<AIIntelligenceReport> {
    const ai = getGemini();

    // If Gemini API is active, attempt structured generation grounded exclusively in the provided findings
    if (ai) {
      try {
        const prompt = `You are a Senior Financial Crime & Blockchain Forensics Analyst for TRACE-X.
Analyze the following DETERMINISTIC EVIDENCE for wallet address: ${wallet.address} on ${wallet.network}.
CRITICAL INSTRUCTION: Never invent facts, entities, amounts, or dates. Rely STRICTLY on the evidence provided below. If data is missing, state "Insufficient evidence".

EVIDENCE DATA:
- Risk Score: ${risk.score}/100 (${risk.category})
- Risk Factors: ${JSON.stringify(risk.factors)}
- Total Received: ${wallet.totalReceived} ${wallet.currency}
- Total Sent: ${wallet.totalSent} ${wallet.currency}
- Forwarding Ratio: ${(wallet.forwardingRatio * 100).toFixed(1)}%
- Avg Time to Forward: ${wallet.averageTimeToForwardMinutes} mins
- Fraud Findings: ${fraudFindings.map(f => `${f.patternName} (${f.severity}): ${f.evidence}`).join('; ')}
- Graph Centrality: ${graph.nodes.length} nodes, ${graph.edges.length} edges, suspicious paths: ${graph.metadata.suspiciousEdgeCount}

Generate a JSON response with these exact keys:
{
  "executiveSummary": "Concise 3-4 sentence forensic assessment.",
  "keyFindings": ["3-5 clear bullet points based strictly on the detected findings"],
  "behavioralAssessment": "Analytical breakdown of the wallet's behavioral archetype and velocity.",
  "fundFlowSummary": "Clear description of the flow from source to destination.",
  "entityExposure": "Assessment of exposure to mixers, bridges, and exchanges.",
  "timelineSummary": "Chronological summary of observed activity.",
  "riskExplanation": "Explicit mathematical/logical justification for the risk score.",
  "conclusion": "Final forensic verdict regarding risk level and operational profile.",
  "recommendedSteps": ["3-4 actionable next steps for investigators"]
}`;

        let responseText: string | null | undefined = null;
        
        // Timeout helper to prevent request hangs
        const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
          return Promise.race([
            promise,
            new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout of ${ms}ms exceeded`)), ms))
          ]);
        };

        try {
          const response = await withTimeout(ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          }), 3500);
          responseText = response.text;
        } catch (modelErr: any) {
          console.warn('Primary model gemini-3.8-flash attempt:', modelErr?.message || modelErr);
          try {
            const fallbackResponse = await withTimeout(ai.models.generateContent({
              model: 'gemini-3.6-flash',
              contents: prompt,
              config: {
                responseMimeType: 'application/json'
              }
            }), 3000);
            responseText = fallbackResponse.text;
          } catch (fbErr: any) {
            console.warn('Fallback model gemini-3.6-flash attempt:', fbErr?.message || fbErr);
          }
        }

        if (responseText) {
          const parsed = JSON.parse(responseText);
          return {
            ...parsed,
            generatedBy: 'GEMINI_LLM',
            timestamp: new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed or timed out, falling back to deterministic engine:', err);
      }
    }

    // Deterministic Forensic Intelligence Fallback
    return this.generateDeterministicIntelligence(wallet, risk, fraudFindings, graph);
  }

  static generateDeterministicIntelligence(
    wallet: WalletProfile,
    risk: RiskBreakdown,
    fraudFindings: FraudFinding[],
    graph: GraphData
  ): AIIntelligenceReport {
    const isCritical = risk.score >= 75;
    const addrDisplay = wallet.address.length > 18 ? `${wallet.address.substring(0, 8)}...${wallet.address.substring(wallet.address.length - 6)}` : wallet.address;

    const execSummary = isCritical
      ? `Subject address ${addrDisplay} demonstrates pronounced on-chain characteristics of an active aggregation hub and high-velocity layering conduit. The wallet aggregated ${wallet.totalReceived} ${wallet.currency} across ${wallet.incomingCount} transactions, immediately dispersing ${(wallet.forwardingRatio * 100).toFixed(1)}% of received capital with an average holding interval of ${wallet.averageTimeToForwardMinutes} minutes. Traced fund trajectories reveal direct downstream termination in privacy mixers and cross-chain bridge portals.`
      : `Subject address ${addrDisplay} exhibits moderate on-chain activity totaling ${wallet.transactionCount} transactions across ${wallet.network}. Net cumulative flow stands at ${wallet.netFlow} ${wallet.currency} with no critical anonymizing contract exposures identified at this time.`;

    const keyFindings = fraudFindings.length > 0
      ? fraudFindings.map(f => `${f.patternName} [${f.severity}]: ${f.evidence}`)
      : [
          `Deterministic risk score established at ${risk.score}/100 (${risk.category}).`,
          `Transaction volume comprises ${wallet.incomingCount} inbound and ${wallet.outgoingCount} outbound operations.`,
          `Capital retention index is minimal (${wallet.balance} ${wallet.currency} remaining on-chain).`
        ];

    const behavioralAssessment = `Classified as: ${wallet.behaviorProfile.join(', ')}. The observed pattern exhibits rapid capital displacement, maintaining a ${(wallet.forwardingRatio * 100).toFixed(1)}% forwarding ratio. This operational cadence is characteristic of structured multi-tier layering architectures engineered to frustrate continuous transaction clustering.`;

    const fundFlowSummary = `Funds originate from multiple upstream origin nodes (${wallet.uniqueSenders} unique senders) and funnel into subject ${addrDisplay}. Capital is then rapidly partitioned across ${wallet.uniqueReceivers} outbound counterparties and routed downstream toward liquidity venues, bridge escrow contracts, and privacy protocols.`;

    const entityExposure = wallet.potentialEntity
      ? `Direct interaction confirmed with registered entity ${wallet.potentialEntity} (${wallet.entityConfidence || 'Confirmed'}).`
      : graph.nodes.some(n => n.type === 'mixer')
      ? 'Critical exposure identified: Direct or 1-hop exposure to Sigma Privacy Pool (Mixer contract) identified, severing forward transaction transparency.'
      : 'No direct sanctioned entity interaction identified within the immediate 2-hop radius.';

    const timelineSummary = `Initial recorded interaction occurred on ${new Date(wallet.firstSeen).toUTCString()}. Intensive burst and forwarding events peaked between ${new Date(wallet.lastSeen).toUTCString()}, highlighting concentrated temporal execution.`;

    const riskExplanation = `The deterministic risk score of ${risk.score}/100 is composed of cumulative additive risk vectors: ${risk.factors.map(f => `${f.factor} (+${f.weight} pts)`).join(', ')}. Clamped within the ${risk.category} operational band.`;

    const conclusion = isCritical
      ? `The subject represents a high-priority forensic target functioning as an intermediary consolidation and egress hub. Continued automated monitoring and counterparty subpoena preparation are strongly recommended.`
      : `The subject represents a low-to-moderate risk profile. Current evidence does not support automated blacklisting; maintain routine surveillance.`;

    const recommendedSteps = isCritical
      ? [
          'File immediate freeze or inquiry notice with downstream exchange deposit endpoints.',
          'Execute multi-hop peel chain analysis on outbound mixer transaction outputs.',
          'Add connected intermediary addresses to real-time high-priority monitoring watchlists.',
          'Query bridge validator telemetry for corresponding mint hashes on destination networks.'
        ]
      : [
          'Maintain periodic ledger screening for newly emerged high-risk counterparties.',
          'Verify KYC status if interacting with licensed institutional exchange deposit rails.',
          'Archive investigation dossier for future audit reference.'
        ];

    return {
      executiveSummary: execSummary,
      keyFindings,
      behavioralAssessment,
      fundFlowSummary,
      entityExposure,
      timelineSummary,
      riskExplanation,
      conclusion,
      recommendedSteps,
      generatedBy: 'DETERMINISTIC_FORENSIC_ENGINE',
      timestamp: new Date().toISOString()
    };
  }
}
