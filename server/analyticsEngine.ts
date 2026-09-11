import { Transaction, WalletProfile } from './types';
import { db, resolveAddress } from './database';

export interface WalletAnalyticsFeatures {
  address: string;
  network: string;
  totalReceived: number;
  totalSent: number;
  netFlow: number;
  currentBalance: number;
  transactionCount: number;
  incomingCount: number;
  outgoingCount: number;
  uniqueSenders: number;
  uniqueReceivers: number;
  counterpartyCount: number;
  averageTransactionAmount: number;
  maximumTransactionAmount: number;
  forwardingRatio: number;
  averageTimeToForwardMinutes: number;
  rapidMovementCount: number;
  burstCount: number;
  dormantToActiveScore: number;
  behaviorProfile: string[];
  firstSeen: string;
  lastSeen: string;
}

export class AnalyticsEngine {
  static extractFeatures(address: string, network = 'Ethereum', rawTxs?: Transaction[]): WalletAnalyticsFeatures {
    const clean = address.trim();
    const resolved = resolveAddress(clean);
    const lower = clean.toLowerCase();
    const resolvedLower = resolved.toLowerCase();
    const txs = rawTxs || db.getTransactionsForAddress(address);

    let totalReceived = 0;
    let totalSent = 0;
    let incomingCount = 0;
    let outgoingCount = 0;
    const senders = new Set<string>();
    const receivers = new Set<string>();
    const amounts: number[] = [];
    let maxAmount = 0;

    // Sort by timestamp
    const sortedTxs = [...txs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sortedTxs.forEach(t => {
      const fromLower = t.fromAddress.toLowerCase();
      const toLower = t.toAddress.toLowerCase();
      const isIncoming = toLower === lower || toLower === resolvedLower;
      const isOutgoing = fromLower === lower || fromLower === resolvedLower;

      amounts.push(t.amount);
      if (t.amount > maxAmount) maxAmount = t.amount;

      if (isIncoming) {
        totalReceived += t.amount;
        incomingCount++;
        senders.add(t.fromAddress.toLowerCase());
      }
      if (isOutgoing) {
        totalSent += t.amount;
        outgoingCount++;
        receivers.add(t.toAddress.toLowerCase());
      }
    });

    const transactionCount = txs.length;
    const netFlow = parseFloat((totalReceived - totalSent).toFixed(4));
    const currentBalance = Math.max(0, netFlow);
    const uniqueSenders = senders.size;
    const uniqueReceivers = receivers.size;
    const allCounterparties = new Set([...senders, ...receivers]);
    const counterpartyCount = allCounterparties.size;

    const avgAmount = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
    const forwardingRatio = totalReceived > 0 ? Math.min(1.0, totalSent / totalReceived) : 0;

    // Calculate time to forward and rapid movement
    let forwardDeltasMinutes: number[] = [];
    let rapidMovementCount = 0;

    for (let i = 0; i < sortedTxs.length - 1; i++) {
      const curr = sortedTxs[i];
      if (curr.toAddress.toLowerCase() === lower) {
        // Find next outgoing
        for (let j = i + 1; j < sortedTxs.length; j++) {
          const next = sortedTxs[j];
          if (next.fromAddress.toLowerCase() === lower) {
            const deltaMs = new Date(next.timestamp).getTime() - new Date(curr.timestamp).getTime();
            const deltaMins = deltaMs / (1000 * 60);
            if (deltaMins > 0 && deltaMins < 180) { // within 3 hours
              forwardDeltasMinutes.push(deltaMins);
              if (deltaMins <= 15) {
                rapidMovementCount++;
              }
            }
            break;
          }
        }
      }
    }

    const averageTimeToForwardMinutes = forwardDeltasMinutes.length > 0
      ? parseFloat((forwardDeltasMinutes.reduce((a, b) => a + b, 0) / forwardDeltasMinutes.length).toFixed(1))
      : 0;

    // Detect burst activity: 3+ transactions within 10 minutes
    let burstCount = 0;
    for (let i = 0; i < sortedTxs.length - 2; i++) {
      const t1 = new Date(sortedTxs[i].timestamp).getTime();
      const t3 = new Date(sortedTxs[i + 2].timestamp).getTime();
      if ((t3 - t1) <= 10 * 60 * 1000) {
        burstCount++;
      }
    }

    // Dormant to active score: check if earliest gap > 7 days then rapid activity
    let dormantToActiveScore = 0.1;
    if (sortedTxs.length >= 4) {
      const tFirst = new Date(sortedTxs[0].timestamp).getTime();
      const tSecond = new Date(sortedTxs[1].timestamp).getTime();
      if ((tSecond - tFirst) > 10 * 24 * 3600 * 1000) {
        dormantToActiveScore = 0.85;
      }
    }

    // Determine Behavior Profiles
    const behaviorProfile: string[] = [];
    if (uniqueSenders >= 4 && outgoingCount > 0) behaviorProfile.push('Fan-In Aggregator');
    if (uniqueReceivers >= 4) behaviorProfile.push('Fan-Out Distributor');
    if (forwardingRatio >= 0.85 && averageTimeToForwardMinutes > 0 && averageTimeToForwardMinutes <= 20) {
      behaviorProfile.push('High-Velocity Pass-Through');
      behaviorProfile.push('Layering Conduit');
    }
    if (forwardingRatio >= 0.70 && forwardingRatio < 0.85) behaviorProfile.push('Intermediary Hop');
    if (burstCount >= 2) behaviorProfile.push('Burst Transaction Pattern');
    if (totalSent > 0 && totalReceived > 0 && Math.abs(netFlow) < totalReceived * 0.05) {
      behaviorProfile.push('Balance Depletion (Zero-State)');
    }
    if (behaviorProfile.length === 0) {
      if (incomingCount > outgoingCount * 2) behaviorProfile.push('Accumulator');
      else if (outgoingCount > incomingCount * 2) behaviorProfile.push('Distributor');
      else behaviorProfile.push('Standard Peer-to-Peer');
    }

    const firstSeen = sortedTxs.length > 0 ? sortedTxs[0].timestamp : new Date().toISOString();
    const lastSeen = sortedTxs.length > 0 ? sortedTxs[sortedTxs.length - 1].timestamp : new Date().toISOString();

    return {
      address,
      network,
      totalReceived: parseFloat(totalReceived.toFixed(4)),
      totalSent: parseFloat(totalSent.toFixed(4)),
      netFlow,
      currentBalance,
      transactionCount,
      incomingCount,
      outgoingCount,
      uniqueSenders,
      uniqueReceivers,
      counterpartyCount,
      averageTransactionAmount: parseFloat(avgAmount.toFixed(4)),
      maximumTransactionAmount: parseFloat(maxAmount.toFixed(4)),
      forwardingRatio: parseFloat(forwardingRatio.toFixed(3)),
      averageTimeToForwardMinutes,
      rapidMovementCount,
      burstCount,
      dormantToActiveScore,
      behaviorProfile,
      firstSeen,
      lastSeen
    };
  }
}
