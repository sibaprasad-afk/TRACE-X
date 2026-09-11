// Script to generate high-fidelity, coherent demo dataset for TRACE-X
import fs from 'fs';
import path from 'path';

const demoWallets = [
  {
    address: "DEMO_WALLET_001",
    canonicalAddress: "0x8F3a29B917E0c1a96752047814c8E48a91A2dD01",
    label: "Primary Suspicious Hub (Case Subject)",
    network: "Ethereum",
    tag: "High Velocity Aggregator & Layerer",
    riskScore: 87,
    riskCategory: "CRITICAL",
    entity: null,
    clusterId: "CLUST_001_SUSPICIOUS_HUB",
    firstSeen: "2026-08-14T02:12:00Z",
    lastSeen: "2026-09-10T22:45:00Z",
    balance: 4.82,
    totalReceived: 348.5,
    totalSent: 343.68,
    currency: "ETH"
  },
  {
    address: "0x3a1B98f6C2e5917D968841B9C590E81a8b1C9001",
    label: "Source Inflow Alpha (Phishing Drain)",
    network: "Ethereum",
    tag: "Victim Inflow Cluster",
    riskScore: 68,
    riskCategory: "HIGH",
    entity: null,
    clusterId: "CLUST_002_INFLOW_VICTIMS",
    firstSeen: "2026-08-10T14:20:00Z",
    lastSeen: "2026-09-08T18:10:00Z",
    balance: 0.12,
    totalReceived: 85.0,
    totalSent: 84.88,
    currency: "ETH"
  },
  {
    address: "0x4b2C87e5D3f6928E979952CaD601F92b9c2D9002",
    label: "Source Inflow Beta (Exploit Conduit)",
    network: "Ethereum",
    tag: "Malicious Origin",
    riskScore: 82,
    riskCategory: "VERY HIGH",
    entity: null,
    clusterId: "CLUST_002_INFLOW_VICTIMS",
    firstSeen: "2026-08-12T09:00:00Z",
    lastSeen: "2026-09-09T11:30:00Z",
    balance: 0.05,
    totalReceived: 120.4,
    totalSent: 120.35,
    currency: "ETH"
  },
  {
    address: "0x5c3D76d4E4a7939F980063DbE712A03c0d3E9003",
    label: "Source Inflow Gamma (Social Eng Drain)",
    network: "Ethereum",
    tag: "Drained Account",
    riskScore: 71,
    riskCategory: "VERY HIGH",
    entity: null,
    clusterId: "CLUST_002_INFLOW_VICTIMS",
    firstSeen: "2026-08-15T16:45:00Z",
    lastSeen: "2026-09-10T04:20:00Z",
    balance: 0.22,
    totalReceived: 92.5,
    totalSent: 92.28,
    currency: "ETH"
  },
  {
    address: "0x9a8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A01",
    label: "Intermediary Hopper A",
    network: "Ethereum",
    tag: "Pass-Through Layering Node",
    riskScore: 79,
    riskCategory: "VERY HIGH",
    entity: null,
    clusterId: "CLUST_001_SUSPICIOUS_HUB",
    firstSeen: "2026-08-18T10:00:00Z",
    lastSeen: "2026-09-10T21:15:00Z",
    balance: 1.15,
    totalReceived: 145.0,
    totalSent: 143.85,
    currency: "ETH"
  },
  {
    address: "0x8b7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A02B2",
    label: "Intermediary Hopper B",
    network: "Ethereum",
    tag: "Fast Forwarding Intermediary",
    riskScore: 74,
    riskCategory: "VERY HIGH",
    entity: null,
    clusterId: "CLUST_001_SUSPICIOUS_HUB",
    firstSeen: "2026-08-19T11:30:00Z",
    lastSeen: "2026-09-10T21:50:00Z",
    balance: 0.88,
    totalReceived: 110.2,
    totalSent: 109.32,
    currency: "ETH"
  },
  {
    address: "0x6d5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A04D4E4F4",
    label: "Layering Dispersion Node 1",
    network: "Ethereum",
    tag: "Micro-Splitting Conduit",
    riskScore: 65,
    riskCategory: "HIGH",
    entity: null,
    clusterId: "CLUST_003_LAYERING_CELL",
    firstSeen: "2026-08-22T08:00:00Z",
    lastSeen: "2026-09-10T22:00:00Z",
    balance: 0.45,
    totalReceived: 78.4,
    totalSent: 77.95,
    currency: "ETH"
  },
  {
    address: "0x8888888888882e3b2e3b2e3b2e3b2e3b2e3b2e3b",
    label: "Sigma Privacy Pool (Mixer)",
    network: "Ethereum",
    tag: "Anonymizer Contract",
    riskScore: 98,
    riskCategory: "CRITICAL",
    entity: "DEMO_MIXER_SIGMA",
    clusterId: "CLUST_MIXER_01",
    firstSeen: "2025-02-14T11:00:00Z",
    lastSeen: "2026-09-10T22:40:00Z",
    balance: 1420.5,
    totalReceived: 5410.8,
    totalSent: 3990.3,
    currency: "ETH"
  },
  {
    address: "0x40ec5b33f54e08337052b7eee04b23333addf4e1",
    label: "Nexus Omnichain Portal (Bridge)",
    network: "Ethereum",
    tag: "Cross-Chain Bridge",
    riskScore: 35,
    riskCategory: "MEDIUM",
    entity: "DEMO_BRIDGE_ALPHA",
    clusterId: "CLUST_BRIDGE_01",
    firstSeen: "2023-11-01T04:22:00Z",
    lastSeen: "2026-09-10T22:42:00Z",
    balance: 8540.0,
    totalReceived: 32100.0,
    totalSent: 23560.0,
    currency: "ETH"
  },
  {
    address: "0x1111111254fb6c44bac0bed2854e76f90643097d",
    label: "Alpha Global Exchange Deposit",
    network: "Ethereum",
    tag: "Tier-1 VASP Deposit",
    riskScore: 12,
    riskCategory: "LOW",
    entity: "DEMO_EXCHANGE_ALPHA",
    clusterId: "CLUST_VASP_ALPHA",
    firstSeen: "2024-01-15T08:00:00Z",
    lastSeen: "2026-09-10T22:30:00Z",
    balance: 420.0,
    totalReceived: 14820.5,
    totalSent: 14400.5,
    currency: "ETH"
  }
];

// Generate 220+ coherent transactions
const transactions = [];
let txIndex = 1000;

function createTx(hash, from, to, amount, asset, network, timestamp, fee, status = "CONFIRMED", isSuspicious = false, riskScore = 20, flags = []) {
  return {
    id: `tx_${txIndex++}`,
    txHash: hash,
    network,
    fromAddress: from,
    toAddress: to,
    amount,
    asset,
    fee,
    timestamp,
    status,
    isSuspicious,
    riskScore,
    flags
  };
}

const baseTime = new Date("2026-09-08T06:00:00Z").getTime();

// Phase 1: Fan-in to DEMO_WALLET_001 from multiple sources
const sources = [
  "0x3a1B98f6C2e5917D968841B9C590E81a8b1C9001",
  "0x4b2C87e5D3f6928E979952CaD601F92b9c2D9002",
  "0x5c3D76d4E4a7939F980063DbE712A03c0d3E9003",
  "0x6d4E65c3F5b8940A991174EcF823B14d1e4F9004",
  "0x7e5F54b2A6c9951B902285Fd0934C25e2f5A9005",
  "0x8a1c9006b52817d968841b9c590e81a8b1c9006a",
  "0x9b2d9007c63928e979952cad601f92b9c2d9007b",
  "0xac3e9008d74a39f980063dbe712a03c0d3e9008c"
];

let currentTime = baseTime;

// Generate upstream victim inflows
sources.forEach((src, sIdx) => {
  for (let i = 0; i < 4; i++) {
    currentTime += 1000 * 60 * (15 + (i * 12) + (sIdx * 8));
    const amt = parseFloat((8.5 + (sIdx * 3.2) + (i * 2.1)).toFixed(3));
    transactions.push(
      createTx(
        `0x9a${txIndex}f${sIdx}${i}e876543210fedcba9876543210123456789abcdef0123456789abcde`,
        src,
        "DEMO_WALLET_001",
        amt,
        "ETH",
        "Ethereum",
        new Date(currentTime).toISOString(),
        0.0034,
        "CONFIRMED",
        true,
        78,
        ["RAPID_FAN_IN", "VICTIM_DRAIN_AGGREGATION"]
      )
    );
  }
});

// Phase 2: Rapid fund forwarding & burst from DEMO_WALLET_001 to Intermediaries
const intermediaries = [
  "0x9a8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A01",
  "0x8b7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A02B2",
  "0x7c6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A03C3D3"
];

intermediaries.forEach((interm, idx) => {
  for (let i = 0; i < 6; i++) {
    currentTime += 1000 * 60 * (3 + (i * 2)); // rapid: just 3-15 minutes after arrival!
    const amt = parseFloat((14.2 + (idx * 5.4) + (i * 3.1)).toFixed(3));
    transactions.push(
      createTx(
        `0x8b${txIndex}c${idx}${i}a123456789abcdef0123456789abcdef0123456789abcdef012345678`,
        "DEMO_WALLET_001",
        interm,
        amt,
        "ETH",
        "Ethereum",
        new Date(currentTime).toISOString(),
        0.0041,
        "CONFIRMED",
        true,
        88,
        ["RAPID_FORWARDING", "BURST_ACTIVITY", "HIGH_FORWARDING_RATIO"]
      )
    );
  }
});

// Phase 3: Intermediaries to Layering dispersion nodes
const layer2Nodes = [
  "0x6d5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A04D4E4F4",
  "0x5e4F3A2B1C0D9E8F7A6B5C4D3E2F1A05E5F5A5B5",
  "0x4f3A2B1C0D9E8F7A6B5C4D3E2F1A06F6A6B6C6D6",
  "0x3e2F1A07A6B5C4D3E2F1A07B7C7D7E7F7A7B7C7D"
];

intermediaries.forEach((interm, iIdx) => {
  layer2Nodes.forEach((l2, lIdx) => {
    for (let k = 0; k < 3; k++) {
      currentTime += 1000 * 60 * (6 + (k * 4));
      const amt = parseFloat((4.8 + (iIdx * 1.5) + (lIdx * 1.1) + (k * 0.8)).toFixed(3));
      transactions.push(
        createTx(
          `0x7c${txIndex}b${iIdx}${lIdx}${k}def0123456789abcdef0123456789abcdef0123456789abcdef01`,
          interm,
          l2,
          amt,
          "ETH",
          "Ethereum",
          new Date(currentTime).toISOString(),
          0.0028,
          "CONFIRMED",
          true,
          82,
          ["LAYERING_PATTERN", "PASS_THROUGH"]
        )
      );
    }
  });
});

// Phase 4: Dispersion nodes to Mixers, Bridges, and VASPs (Destination Exits)
layer2Nodes.forEach((l2, lIdx) => {
  // To Mixer
  currentTime += 1000 * 60 * 12;
  transactions.push(
    createTx(
      `0x6d${txIndex}m${lIdx}00112233445566778899aabbccddeeff00112233445566778899aabbccdd`,
      l2,
      "0x8888888888882e3b2e3b2e3b2e3b2e3b2e3b2e3b", // Sigma Mixer
      parseFloat((12.4 + lIdx * 2.5).toFixed(3)),
      "ETH",
      "Ethereum",
      new Date(currentTime).toISOString(),
      0.0055,
      "CONFIRMED",
      true,
      96,
      ["MIXER_DEPOSIT", "ANONYMIZER_EXPOSURE", "CRITICAL_DESTINATION"]
    )
  );

  // To Bridge (Cross-chain hop)
  currentTime += 1000 * 60 * 8;
  transactions.push(
    createTx(
      `0x5e${txIndex}b${lIdx}112233445566778899aabbccddeeff00112233445566778899aabbccddee`,
      l2,
      "0x40ec5b33f54e08337052b7eee04b23333addf4e1", // Nexus Bridge
      parseFloat((18.6 + lIdx * 3.1).toFixed(3)),
      "ETH",
      "Ethereum",
      new Date(currentTime).toISOString(),
      0.0049,
      "CONFIRMED",
      true,
      76,
      ["CROSS_CHAIN_BRIDGE", "INFERRED_RELATIONSHIP"]
    )
  );

  // To Alpha Exchange
  currentTime += 1000 * 60 * 14;
  transactions.push(
    createTx(
      `0x4f${txIndex}x${lIdx}2233445566778899aabbccddeeff00112233445566778899aabbccddeeff`,
      l2,
      "0x1111111254fb6c44bac0bed2854e76f90643097d", // Alpha VASP
      parseFloat((9.2 + lIdx * 1.8).toFixed(3)),
      "ETH",
      "Ethereum",
      new Date(currentTime).toISOString(),
      0.0031,
      "CONFIRMED",
      false,
      35,
      ["VASP_DEPOSIT_CASHOUT"]
    )
  );

  // To Beta Exchange
  currentTime += 1000 * 60 * 10;
  transactions.push(
    createTx(
      `0x3a${txIndex}y${lIdx}33445566778899aabbccddeeff00112233445566778899aabbccddeeff00`,
      l2,
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // Beta Prime VASP
      parseFloat((7.8 + lIdx * 1.4).toFixed(3)),
      "USDT",
      "Ethereum",
      new Date(currentTime).toISOString(),
      0.0025,
      "CONFIRMED",
      false,
      30,
      ["VASP_DEPOSIT_CASHOUT"]
    )
  );
});

// Phase 5: Cross-chain destination transactions on Polygon and BNB Chain for the bridge
const polygonWallets = [
  "0x8F3a29B917E0c1a96752047814c8E48a91A2dD01_POLY",
  "0xpolyDestA1B2C3D4E5F67890123456789012345678",
  "0xpolyDestB2C3D4E5F6789012345678901234567890"
];

polygonWallets.forEach((pw, pIdx) => {
  currentTime += 1000 * 60 * 20;
  transactions.push(
    createTx(
      `0xpoly${txIndex}${pIdx}aabbccddee112233445566778899aabbccddeeff00112233445566778899`,
      "0x40ec5b33f54e08337052b7eee04b23333addf4e1",
      pw,
      parseFloat((15.4 + pIdx * 4.2).toFixed(3)),
      "MATIC",
      "Polygon",
      new Date(currentTime).toISOString(),
      0.015,
      "CONFIRMED",
      true,
      65,
      ["CROSS_CHAIN_DESTINATION", "POTENTIAL_CROSS_CHAIN_MOVEMENT"]
    )
  );
});

// Phase 6: Circular interaction / Re-interaction testing
currentTime += 1000 * 60 * 30;
transactions.push(
  createTx(
    `0xcirc${txIndex}01aabbccddeeff00112233445566778899aabbccddeeff00112233445566`,
    "0x6d5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A04D4E4F4",
    "DEMO_WALLET_001",
    1.25,
    "ETH",
    "Ethereum",
    new Date(currentTime).toISOString(),
    0.003,
    "CONFIRMED",
    true,
    84,
    ["CIRCULAR_TRANSACTION_REENTRY"]
  )
);

// Phase 7: Additional baseline and regular transactions to exceed 210 total transactions
const benignWallets = [
  "0xBenignUserA1010101010101010101010101010101",
  "0xBenignUserB2020202020202020202020202020202",
  "0xBenignUserC3030303030303030303030303030303",
  "0xBenignMerchantD40404040404040404040404040404",
  "0xBenignVaultE5050505050505050505050505050505"
];

for (let i = 0; i < 115; i++) {
  currentTime += 1000 * 60 * (10 + (i % 25));
  const fromW = benignWallets[i % benignWallets.length];
  const toW = benignWallets[(i + 1) % benignWallets.length];
  const amt = parseFloat((0.5 + (i * 0.15) % 10).toFixed(3));
  transactions.push(
    createTx(
      `0xnorm${txIndex}${i}aabbccddeeff00112233445566778899aabbccddeeff0011223344556677`,
      fromW,
      toW,
      amt,
      i % 3 === 0 ? "USDT" : "ETH",
      i % 5 === 0 ? "Polygon" : i % 7 === 0 ? "Bitcoin" : "Ethereum",
      new Date(currentTime).toISOString(),
      0.0018,
      "CONFIRMED",
      false,
      10,
      ["STANDARD_RETAIL_TRANSFER"]
    )
  );
}

fs.writeFileSync(path.resolve('./data/demo_wallets.json'), JSON.stringify(demoWallets, null, 2));
fs.writeFileSync(path.resolve('./data/demo_transactions.json'), JSON.stringify(transactions, null, 2));

// Also generate demo_transactions.csv
const csvHeader = "timestamp,tx_hash,network,from_address,to_address,asset,amount,fee,is_suspicious,risk_score\n";
const csvRows = transactions.map(t => 
  `"${t.timestamp}","${t.txHash}","${t.network}","${t.fromAddress}","${t.toAddress}","${t.asset}",${t.amount},${t.fee},${t.isSuspicious},${t.riskScore}`
).join("\n");
fs.writeFileSync(path.resolve('./data/demo_transactions.csv'), csvHeader + csvRows);

console.log(`Generated ${demoWallets.length} demo wallets and ${transactions.length} transactions successfully.`);
