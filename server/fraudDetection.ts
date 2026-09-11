import { WalletAnalyticsFeatures } from './analyticsEngine';
import { FraudFinding, Transaction } from './types';
import { db } from './database';

export class FraudDetectionEngine {
  static detectPatterns(features: WalletAnalyticsFeatures, transactions: Transaction[]): FraudFinding[] {
    const findings: FraudFinding[] = [];
    const lower = features.address.toLowerCase();

    // 1. Rapid Fund Movement
    if (features.rapidMovementCount > 0) {
      const rapidTxs = transactions
        .filter(t => t.fromAddress.toLowerCase() === lower || t.toAddress.toLowerCase() === lower)
        .slice(0, 5)
        .map(t => t.txHash);

      findings.push({
        id: 'finding_rapid_movement',
        patternName: 'Rapid Fund Movement',
        severity: features.rapidMovementCount >= 4 ? 'HIGH' : 'MEDIUM',
        confidence: 'Confirmed',
        description: 'Funds were forwarded rapidly following receipt, minimizing exposure to address freezes or forensic hold periods.',
        evidence: `${features.rapidMovementCount} outbound transactions executed within an average elapsed forwarding window of ${features.averageTimeToForwardMinutes} minutes.`,
        affectedTransactions: rapidTxs,
        affectedWallets: [features.address],
        detectedAt: new Date().toISOString()
      });
    }

    // 2. Fan-In Aggregation Behavior
    if (features.uniqueSenders >= 4) {
      const inboundTxs = transactions
        .filter(t => t.toAddress.toLowerCase() === lower)
        .map(t => t.txHash);
      const originWallets = Array.from(
        new Set(transactions.filter(t => t.toAddress.toLowerCase() === lower).map(t => t.fromAddress))
      ).slice(0, 6);

      findings.push({
        id: 'finding_fan_in',
        patternName: 'Fan-In Aggregation Behavior',
        severity: features.uniqueSenders >= 6 ? 'HIGH' : 'MEDIUM',
        confidence: 'High',
        description: 'The target wallet functions as a centralized collection point, receiving simultaneous or staged payments from multiple non-associated wallets.',
        evidence: `Consolidated ${features.totalReceived} ${features.network === 'Polygon' ? 'MATIC' : 'ETH'} from ${features.uniqueSenders} unique origin sources across ${features.incomingCount} transactions.`,
        affectedTransactions: inboundTxs.slice(0, 8),
        affectedWallets: originWallets,
        detectedAt: new Date().toISOString()
      });
    }

    // 3. Fan-Out Dispersion Behavior
    if (features.uniqueReceivers >= 4) {
      const outboundTxs = transactions
        .filter(t => t.fromAddress.toLowerCase() === lower)
        .map(t => t.txHash);
      const destWallets = Array.from(
        new Set(transactions.filter(t => t.fromAddress.toLowerCase() === lower).map(t => t.toAddress))
      ).slice(0, 6);

      findings.push({
        id: 'finding_fan_out',
        patternName: 'Fan-Out Dispersion Behavior',
        severity: 'MEDIUM',
        confidence: 'High',
        description: 'Outbound capital is partitioned across multiple destination wallets, typical of structuring or layering techniques.',
        evidence: `Dispersed assets across ${features.uniqueReceivers} destination addresses via ${features.outgoingCount} outbound transactions.`,
        affectedTransactions: outboundTxs.slice(0, 8),
        affectedWallets: destWallets,
        detectedAt: new Date().toISOString()
      });
    }

    // 4. Layering Pattern & High Forwarding Ratio
    if (features.forwardingRatio >= 0.85 && features.totalReceived > 1) {
      findings.push({
        id: 'finding_layering_conduit',
        patternName: 'Layering Pattern & Pass-Through Velocity',
        severity: 'HIGH',
        confidence: 'High',
        description: 'The subject exhibits negligible balance retention, operating primarily as a transient pass-through intermediary within a multi-hop laundering architecture.',
        evidence: `Forwarding ratio of ${(features.forwardingRatio * 100).toFixed(1)}% observed with only ${features.currentBalance} residual balance remaining on-chain.`,
        affectedTransactions: transactions.slice(0, 6).map(t => t.txHash),
        affectedWallets: [features.address],
        detectedAt: new Date().toISOString()
      });
    }

    // 5. Mixer / Anonymizer Exposure
    const mixerAddress = '0x8888888888882e3b2e3b2e3b2e3b2e3b2e3b2e3b';
    const mixerTxs = transactions.filter(
      t => t.toAddress.toLowerCase() === mixerAddress.toLowerCase() || t.fromAddress.toLowerCase() === mixerAddress.toLowerCase()
    );

    if (mixerTxs.length > 0 || features.address.toLowerCase() === mixerAddress.toLowerCase()) {
      findings.push({
        id: 'finding_mixer_exposure',
        patternName: 'Mixer / Privacy Pool Anonymizer Exposure',
        severity: 'CRITICAL',
        confidence: 'Confirmed',
        description: 'Direct interaction with flagged non-custodial tumbling contract Sigma Privacy Pool, intended to sever cryptographic traceability.',
        evidence: `${mixerTxs.length} transaction(s) verified engaging contract ${mixerAddress}.`,
        affectedTransactions: mixerTxs.map(t => t.txHash),
        affectedWallets: [features.address, mixerAddress],
        detectedAt: new Date().toISOString()
      });
    }

    // 6. Cross-Chain Bridge Transit
    const bridgeAddress = '0x40ec5b33f54e08337052b7eee04b23333addf4e1';
    const bridgeTxs = transactions.filter(
      t => t.toAddress.toLowerCase() === bridgeAddress.toLowerCase() || t.fromAddress.toLowerCase() === bridgeAddress.toLowerCase()
    );

    if (bridgeTxs.length > 0) {
      findings.push({
        id: 'finding_cross_chain_transit',
        patternName: 'Potential Cross-Chain Bridge Transit',
        severity: 'HIGH',
        confidence: 'High',
        description: 'Capital routed into cross-chain lock contract indicating inferred cross-network fund relocation toward Polygon or BNB Chain.',
        evidence: `Identified bridge lock transfers totaling ${bridgeTxs.reduce((sum, t) => sum + t.amount, 0).toFixed(2)} ETH into Nexus Omnichain Portal.`,
        affectedTransactions: bridgeTxs.map(t => t.txHash),
        affectedWallets: [features.address, bridgeAddress],
        detectedAt: new Date().toISOString()
      });
    }

    // 7. Burst Activity
    if (features.burstCount >= 2) {
      findings.push({
        id: 'finding_burst_activity',
        patternName: 'High-Frequency Burst Execution',
        severity: 'MEDIUM',
        confidence: 'Confirmed',
        description: 'Multiple automated or scripted transactions fired in tight temporal clusters.',
        evidence: `${features.burstCount} separate 10-minute burst clusters identified in transaction logs.`,
        affectedTransactions: transactions.slice(0, 4).map(t => t.txHash),
        affectedWallets: [features.address],
        detectedAt: new Date().toISOString()
      });
    }

    // 8. Circular Movement / Re-entry
    const reEntryTxs = transactions.filter(
      t => t.flags && t.flags.includes('CIRCULAR_TRANSACTION_REENTRY')
    );
    if (reEntryTxs.length > 0) {
      findings.push({
        id: 'finding_circular_reentry',
        patternName: 'Circular Movement & Path Re-entry',
        severity: 'HIGH',
        confidence: 'High',
        description: 'Downstream wallets returned capital back into upstream nodes, creating circular flow loops indicative of artificial volume generation or wash layering.',
        evidence: `Loop identified returning assets back into upstream address ${features.address}.`,
        affectedTransactions: reEntryTxs.map(t => t.txHash),
        affectedWallets: reEntryTxs.map(t => t.fromAddress),
        detectedAt: new Date().toISOString()
      });
    }

    return findings;
  }
}
