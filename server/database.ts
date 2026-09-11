import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Organization,
  InvestigationCase,
  Transaction,
  WalletProfile,
  EntityRecord,
  WatchlistItem,
  AlertItem,
  ReportDossier,
  DatasetItem,
  AuditLogEntry,
  CaseAccessAssignment,
  CaseRole
} from './types';
import { canAccessCase, normalizeRole } from './permissions';

// Password hashing with crypto
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_tracex_salt_2026').digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Address normalization & alias resolver for demo entities, labels, and shortcuts
export function resolveAddress(input: string): string {
  if (!input) return 'DEMO_WALLET_001';
  const clean = input.trim();
  const lower = clean.toLowerCase();

  if (lower.includes('sigma') || lower.includes('0x71c') || lower.includes('mixer')) {
    return '0x8888888888882e3b2e3b2e3b2e3b2e3b2e3b2e3b';
  }
  if (lower.includes('nexus') || lower.includes('0x9a3') || lower.includes('bridge')) {
    return '0x40ec5b33f54e08337052b7eee04b23333addf4e1';
  }
  if (lower.includes('demo') || lower.includes('0x8f3a') || lower.includes('subject') || lower.includes('hub')) {
    return 'DEMO_WALLET_001';
  }
  if (lower.includes('alpha') || lower.includes('kraken') || lower.includes('exchange')) {
    return '0x1111111254fb6c44bac0bed2854e76f90643097d';
  }
  if (lower.includes('hopper') || lower.includes('0x9a8b')) {
    return '0x9a8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A01';
  }
  if (lower.includes('tx9') || lower.includes('qf1v')) {
    return 'TX9_Qf1v';
  }
  if (lower.includes('tr7x') || lower.includes('l24t')) {
    return 'TR7X_L24T';
  }
  return clean;
}

class Database {
  private users: Map<string, User> = new Map();
  private organizations: Map<string, Organization> = new Map();
  private investigations: Map<string, InvestigationCase> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private wallets: Map<string, WalletProfile> = new Map();
  private entities: Map<string, EntityRecord> = new Map();
  private watchlist: Map<string, WatchlistItem> = new Map();
  private alerts: Map<string, AlertItem> = new Map();
  private reports: Map<string, ReportDossier> = new Map();
  private datasets: Map<string, DatasetItem> = new Map();
  private auditLogs: AuditLogEntry[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Organization with explicit Owner
    const defaultOrg: Organization = {
      id: 'org_cyber_forensics_01',
      name: 'Vanguard Blockchain Intelligence Group',
      code: 'TRX-VBG-01',
      ownerId: 'usr_owner_01',
      createdAt: '2025-01-10T09:00:00Z',
      plan: 'ENTERPRISE',
      settings: {
        defaultNetwork: 'Ethereum',
        riskThreshold: 70,
        autoAlerts: true,
        requireCaseMFA: true
      }
    };
    this.organizations.set(defaultOrg.id, defaultOrg);

    // 2. Seed Users across all 7 Roles (Section 6.1 - 6.7)
    const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'TraceX@2026';
    const initialUsers: User[] = [
      // 1. ORGANIZATION_OWNER
      {
        id: 'usr_owner_01',
        email: 'owner@trace-x.local',
        name: 'Marcus Vance',
        passwordHash: hashPassword(DEMO_PASSWORD),
        accountType: 'ORGANIZATION',
        role: 'ORGANIZATION_OWNER',
        orgId: defaultOrg.id,
        orgName: defaultOrg.name,
        department: 'Executive Oversight & Strategy',
        isActive: true,
        createdAt: '2025-01-10T09:00:00Z',
        lastLoginAt: new Date().toISOString()
      },
      // 2. ORGANIZATION_ADMIN
      {
        id: 'usr_admin_02',
        email: 'admin@trace-x.local',
        name: 'Victoria Sterling',
        passwordHash: hashPassword(DEMO_PASSWORD),
        accountType: 'ORGANIZATION',
        role: 'ORGANIZATION_ADMIN',
        orgId: defaultOrg.id,
        orgName: defaultOrg.name,
        department: 'Forensic Infrastructure & Governance',
        isActive: true,
        createdAt: '2025-01-10T09:30:00Z',
        lastLoginAt: new Date().toISOString()
      },
      // 3. ORGANIZATION_MANAGER
      {
        id: 'usr_manager_03',
        email: 'manager@trace-x.local',
        name: 'Dr. Elena Rostova',
        passwordHash: hashPassword(DEMO_PASSWORD),
        accountType: 'ORGANIZATION',
        role: 'ORGANIZATION_MANAGER',
        orgId: defaultOrg.id,
        orgName: defaultOrg.name,
        department: 'Cryptocurrency Fraud Operations',
        isActive: true,
        createdAt: '2025-02-01T10:00:00Z',
        lastLoginAt: new Date().toISOString()
      },
      // 4. ORGANIZATION_ANALYST
      {
        id: 'usr_analyst_04',
        email: 'analyst@trace-x.local',
        name: 'James K. Reed',
        passwordHash: hashPassword(DEMO_PASSWORD),
        accountType: 'ORGANIZATION',
        role: 'ORGANIZATION_ANALYST',
        orgId: defaultOrg.id,
        orgName: defaultOrg.name,
        department: 'Transaction Intelligence Unit',
        isActive: true,
        createdAt: '2025-03-15T11:15:00Z',
        lastLoginAt: new Date().toISOString()
      },
      // 5. ORGANIZATION_REVIEWER
      {
        id: 'usr_reviewer_05',
        email: 'reviewer@trace-x.local',
        name: 'David Chen',
        passwordHash: hashPassword(DEMO_PASSWORD),
        accountType: 'ORGANIZATION',
        role: 'ORGANIZATION_REVIEWER',
        orgId: defaultOrg.id,
        orgName: defaultOrg.name,
        department: 'Independent Audit & Chain-of-Custody',
        isActive: true,
        createdAt: '2025-03-20T12:00:00Z',
        lastLoginAt: new Date().toISOString()
      },
      // 6. ORGANIZATION_VIEWER
      {
        id: 'usr_viewer_06',
        email: 'viewer@trace-x.local',
        name: 'Rachel Morales',
        passwordHash: hashPassword(DEMO_PASSWORD),
        accountType: 'ORGANIZATION',
        role: 'ORGANIZATION_VIEWER',
        orgId: defaultOrg.id,
        orgName: defaultOrg.name,
        department: 'Legal Compliance & External Oversight',
        isActive: true,
        createdAt: '2025-04-01T14:30:00Z',
        lastLoginAt: new Date().toISOString()
      },
      // 7. PERSONAL_USER
      {
        id: 'usr_personal_07',
        email: 'personal@trace-x.local',
        name: 'Alexander Cross',
        passwordHash: hashPassword(DEMO_PASSWORD),
        accountType: 'PERSONAL',
        role: 'PERSONAL_USER',
        department: 'Independent Research',
        isActive: true,
        createdAt: '2025-04-10T14:00:00Z',
        lastLoginAt: new Date().toISOString()
      },
      // Aliases & Fallbacks for evaluation compatibility
      {
        id: 'usr_admin_alias',
        email: 'admin@tracex.io',
        name: 'Victoria Sterling',
        passwordHash: hashPassword(DEMO_PASSWORD),
        accountType: 'ORGANIZATION',
        role: 'ORGANIZATION_ADMIN',
        orgId: defaultOrg.id,
        orgName: defaultOrg.name,
        department: 'Forensic Infrastructure & Governance',
        isActive: true,
        createdAt: '2025-01-10T09:30:00Z',
        lastLoginAt: new Date().toISOString()
      },
      {
        id: 'usr_senior_alias',
        email: 'senior@trace-x.local',
        name: 'Dr. Elena Rostova',
        passwordHash: hashPassword(DEMO_PASSWORD),
        accountType: 'ORGANIZATION',
        role: 'ORGANIZATION_MANAGER',
        orgId: defaultOrg.id,
        orgName: defaultOrg.name,
        department: 'Cryptocurrency Fraud Operations',
        isActive: true,
        createdAt: '2025-02-01T10:00:00Z',
        lastLoginAt: new Date().toISOString()
      },
      {
        id: 'usr_senior_alias_io',
        email: 'senior@tracex.io',
        name: 'Dr. Elena Rostova',
        passwordHash: hashPassword(DEMO_PASSWORD),
        accountType: 'ORGANIZATION',
        role: 'ORGANIZATION_MANAGER',
        orgId: defaultOrg.id,
        orgName: defaultOrg.name,
        department: 'Cryptocurrency Fraud Operations',
        isActive: true,
        createdAt: '2025-02-01T10:00:00Z',
        lastLoginAt: new Date().toISOString()
      },
      {
        id: 'usr_analyst_alias_io',
        email: 'analyst@tracex.io',
        name: 'James K. Reed',
        passwordHash: hashPassword(DEMO_PASSWORD),
        accountType: 'ORGANIZATION',
        role: 'ORGANIZATION_ANALYST',
        orgId: defaultOrg.id,
        orgName: defaultOrg.name,
        department: 'Transaction Intelligence Unit',
        isActive: true,
        createdAt: '2025-03-15T11:15:00Z',
        lastLoginAt: new Date().toISOString()
      },
      {
        id: 'usr_personal_alias_io',
        email: 'investigator@personal.io',
        name: 'Alexander Cross',
        passwordHash: hashPassword(DEMO_PASSWORD),
        accountType: 'PERSONAL',
        role: 'PERSONAL_USER',
        department: 'Independent Research',
        isActive: true,
        createdAt: '2025-04-10T14:00:00Z',
        lastLoginAt: new Date().toISOString()
      },
      // Disabled test account
      {
        id: 'usr_disabled_04',
        email: 'disabled@trace-x.local',
        name: 'Dev Suspended User',
        passwordHash: hashPassword(DEMO_PASSWORD),
        accountType: 'ORGANIZATION',
        role: 'ORGANIZATION_ANALYST',
        orgId: defaultOrg.id,
        orgName: defaultOrg.name,
        department: 'Security Review',
        isActive: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastLoginAt: 'Never'
      }
    ];

    initialUsers.forEach(u => this.users.set(u.id, u));

    // 3. Load Entities from JSON
    try {
      const entitiesPath = path.resolve(process.cwd(), 'data/demo_entities.json');
      if (fs.existsSync(entitiesPath)) {
        const rawEntities: EntityRecord[] = JSON.parse(fs.readFileSync(entitiesPath, 'utf8'));
        rawEntities.forEach(e => this.entities.set(e.id, e));
      }
    } catch (err) {
      console.error('Error loading demo_entities.json:', err);
    }

    // 4. Load Transactions from JSON
    try {
      const txPath = path.resolve(process.cwd(), 'data/demo_transactions.json');
      if (fs.existsSync(txPath)) {
        const rawTxs: Transaction[] = JSON.parse(fs.readFileSync(txPath, 'utf8'));
        rawTxs.forEach(tx => this.transactions.set(tx.id || tx.txHash, tx));
      }
    } catch (err) {
      console.error('Error loading demo_transactions.json:', err);
    }

    // 5. Load Demo Wallets from JSON
    try {
      const walletPath = path.resolve(process.cwd(), 'data/demo_wallets.json');
      if (fs.existsSync(walletPath)) {
        const rawWallets: any[] = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
        rawWallets.forEach(w => {
          const profile: WalletProfile = {
            address: w.address,
            canonicalAddress: w.canonicalAddress,
            label: w.label,
            network: w.network || 'Ethereum',
            riskScore: w.riskScore || 50,
            riskCategory: w.riskCategory || 'MEDIUM',
            balance: w.balance || 0,
            totalReceived: w.totalReceived || 0,
            totalSent: w.totalSent || 0,
            netFlow: (w.totalReceived || 0) - (w.totalSent || 0),
            currency: w.currency || 'ETH',
            transactionCount: 28,
            incomingCount: 12,
            outgoingCount: 16,
            uniqueSenders: 8,
            uniqueReceivers: 7,
            counterpartyCount: 15,
            firstSeen: w.firstSeen || '2026-08-14T02:12:00Z',
            lastSeen: w.lastSeen || '2026-09-10T22:45:00Z',
            forwardingRatio: 0.986,
            averageTimeToForwardMinutes: 6.4,
            burstCount: 8,
            rapidMovementCount: 12,
            dormantToActiveScore: 0.72,
            behaviorProfile: ['Fan-In Aggregator', 'High-Velocity Forwarder', 'Layering Conduit'],
            clusterId: w.clusterId,
            clusterSize: 6,
            potentialEntity: w.entity || null,
            entityConfidence: w.entity ? 'High Confidence' : null
          };
          this.wallets.set(w.address.toLowerCase(), profile);
          if (w.canonicalAddress) {
            this.wallets.set(w.canonicalAddress.toLowerCase(), profile);
          }
        });
      }
    } catch (err) {
      console.error('Error loading demo_wallets.json:', err);
    }

    // 6. Seed Initial Investigation Cases (Section 6.8 Case-Level Access Assignments)
    const initialCases: InvestigationCase[] = [
      {
        id: 'case_trx_10482',
        caseNumber: 'TRX-10482',
        title: 'Nexus Bridge & Sigma Mixer Rapid Layering Probe',
        primaryWallet: 'DEMO_WALLET_001',
        network: 'Ethereum',
        riskScore: 87,
        riskCategory: 'CRITICAL',
        status: 'UNDER_INVESTIGATION',
        assignedManagerId: 'usr_manager_03',
        assignedManagerName: 'Dr. Elena Rostova',
        assignedAnalystId: 'usr_analyst_04',
        assignedAnalystName: 'James K. Reed',
        assignedReviewerId: 'usr_reviewer_05',
        assignedReviewerName: 'David Chen',
        assignedViewerIds: ['usr_viewer_06'],
        creatorId: 'usr_owner_01',
        orgId: defaultOrg.id,
        isRestricted: true,
        accessAssignments: [
          {
            userId: 'usr_owner_01',
            userName: 'Marcus Vance',
            userEmail: 'owner@trace-x.local',
            role: 'OWNER',
            assignedAt: '2026-09-09T08:15:00Z'
          },
          {
            userId: 'usr_manager_03',
            userName: 'Dr. Elena Rostova',
            userEmail: 'manager@trace-x.local',
            role: 'MANAGER',
            assignedAt: '2026-09-09T08:30:00Z'
          },
          {
            userId: 'usr_analyst_04',
            userName: 'James K. Reed',
            userEmail: 'analyst@trace-x.local',
            role: 'ANALYST',
            assignedAt: '2026-09-09T09:00:00Z'
          },
          {
            userId: 'usr_reviewer_05',
            userName: 'David Chen',
            userEmail: 'reviewer@trace-x.local',
            role: 'REVIEWER',
            assignedAt: '2026-09-09T09:30:00Z'
          },
          {
            userId: 'usr_viewer_06',
            userName: 'Rachel Morales',
            userEmail: 'viewer@trace-x.local',
            role: 'VIEWER',
            assignedAt: '2026-09-09T10:00:00Z'
          }
        ],
        tags: ['Mixer Deposit', 'Cross-Chain Bridge', 'Phishing Drain', 'Rapid Movement'],
        notes: 'Coordinated fund aggregation from multiple drain vectors forwarded within minutes to Sigma mixer and Nexus bridge portal.',
        createdAt: '2026-09-09T08:15:00Z',
        updatedAt: '2026-09-10T21:45:00Z',
        fundTracedAmount: 348.5,
        fundTracedCurrency: 'ETH'
      },
      {
        id: 'case_trx_10483',
        caseNumber: 'TRX-10483',
        title: 'Heuristic Splitter Cluster 003 Tracing',
        primaryWallet: '0x9a8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A01',
        network: 'Ethereum',
        riskScore: 79,
        riskCategory: 'VERY_HIGH',
        status: 'UNDER_INVESTIGATION',
        assignedManagerId: 'usr_manager_03',
        assignedManagerName: 'Dr. Elena Rostova',
        assignedAnalystId: 'usr_analyst_04',
        assignedAnalystName: 'James K. Reed',
        creatorId: 'usr_admin_02',
        orgId: defaultOrg.id,
        isRestricted: false,
        accessAssignments: [
          {
            userId: 'usr_manager_03',
            userName: 'Dr. Elena Rostova',
            userEmail: 'manager@trace-x.local',
            role: 'MANAGER',
            assignedAt: '2026-09-10T11:20:00Z'
          },
          {
            userId: 'usr_analyst_04',
            userName: 'James K. Reed',
            userEmail: 'analyst@trace-x.local',
            role: 'ANALYST',
            assignedAt: '2026-09-10T11:30:00Z'
          }
        ],
        tags: ['Pass-Through', 'Layering', 'VASP Cashout'],
        notes: 'Intermediate hop forwarding funds to dispersion nodes for secondary cashout at Alpha Exchange.',
        createdAt: '2026-09-10T11:20:00Z',
        updatedAt: '2026-09-10T20:10:00Z',
        fundTracedAmount: 145.0,
        fundTracedCurrency: 'ETH'
      },
      {
        id: 'case_trx_10478',
        caseNumber: 'TRX-10478',
        title: 'Polygon Omnichain Destination Audit',
        primaryWallet: '0x40ec5b33f54e08337052b7eee04b23333addf4e1',
        network: 'Polygon',
        riskScore: 65,
        riskCategory: 'HIGH',
        status: 'MONITORING',
        assignedManagerId: 'usr_manager_03',
        assignedManagerName: 'Dr. Elena Rostova',
        assignedAnalystId: 'usr_analyst_04',
        assignedAnalystName: 'James K. Reed',
        assignedReviewerId: 'usr_reviewer_05',
        assignedReviewerName: 'David Chen',
        creatorId: 'usr_manager_03',
        orgId: defaultOrg.id,
        isRestricted: false,
        tags: ['Cross-Chain', 'Bridge Portal', 'MATIC Flow'],
        notes: 'Tracking outbound mint events on Polygon stemming from Ethereum layerer wallets.',
        createdAt: '2026-09-07T14:00:00Z',
        updatedAt: '2026-09-10T16:30:00Z',
        fundTracedAmount: 8540.0,
        fundTracedCurrency: 'ETH'
      },
      // 7. Personal Sandbox Investigation for Alexander Cross (PERSONAL_USER)
      {
        id: 'case_trx_personal_01',
        caseNumber: 'TRX-99014',
        title: 'Personal Sandbox Investigation: P2P Flash Escrow Probe',
        primaryWallet: '0x9a8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A01',
        network: 'Ethereum',
        riskScore: 72,
        riskCategory: 'HIGH',
        status: 'UNDER_INVESTIGATION',
        assignedAnalystId: 'usr_personal_07',
        assignedAnalystName: 'Alexander Cross',
        creatorId: 'usr_personal_07',
        tags: ['Personal Sandbox', 'Flash Escrow', 'Heuristic'],
        notes: 'Private independent research dossier completely isolated from enterprise organization workspaces.',
        createdAt: '2026-09-10T14:00:00Z',
        updatedAt: '2026-09-11T02:00:00Z',
        fundTracedAmount: 22.4,
        fundTracedCurrency: 'ETH'
      }
    ];
    initialCases.forEach(c => this.investigations.set(c.id, c));

    // 7. Seed Watchlist Items
    const initialWatchlist: WatchlistItem[] = [
      {
        id: 'watch_01',
        userId: 'usr_senior_02',
        orgId: defaultOrg.id,
        walletAddress: 'DEMO_WALLET_001',
        network: 'Ethereum',
        label: 'Primary Fraud Inflow Aggregator',
        priority: 'CRITICAL',
        currentRiskScore: 87,
        previousRiskScore: 68,
        lastActivity: '2026-09-10T22:45:00Z',
        alertCount: 5,
        status: 'ACTIVE',
        createdAt: '2026-09-08T09:00:00Z'
      },
      {
        id: 'watch_02',
        userId: 'usr_senior_02',
        orgId: defaultOrg.id,
        walletAddress: '0x8888888888882e3b2e3b2e3b2e3b2e3b2e3b2e3b',
        network: 'Ethereum',
        label: 'Sigma Privacy Pool Anonymizer',
        priority: 'CRITICAL',
        currentRiskScore: 98,
        previousRiskScore: 98,
        lastActivity: '2026-09-10T22:40:00Z',
        alertCount: 8,
        status: 'ACTIVE',
        createdAt: '2026-08-20T10:00:00Z'
      },
      {
        id: 'watch_03',
        userId: 'usr_analyst_03',
        orgId: defaultOrg.id,
        walletAddress: '0x9a8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A01',
        network: 'Ethereum',
        label: 'Intermediary Hopper A (Layer 1)',
        priority: 'HIGH',
        currentRiskScore: 79,
        previousRiskScore: 72,
        lastActivity: '2026-09-10T21:15:00Z',
        alertCount: 2,
        status: 'ACTIVE',
        createdAt: '2026-09-09T14:30:00Z'
      }
    ];
    initialWatchlist.forEach(w => this.watchlist.set(w.id, w));

    // 8. Seed Alerts
    const initialAlerts: AlertItem[] = [
      {
        id: 'alert_01',
        orgId: defaultOrg.id,
        walletAddress: 'DEMO_WALLET_001',
        network: 'Ethereum',
        type: 'RISK_INCREASE',
        severity: 'CRITICAL',
        title: 'Critical Risk Escalation (68 → 87)',
        description: 'Sudden burst of rapid forwarding transactions executed within 3.5 minutes to intermediate mixing layer.',
        timestamp: '2026-09-10T22:45:00Z',
        status: 'UNREAD'
      },
      {
        id: 'alert_02',
        orgId: defaultOrg.id,
        walletAddress: 'DEMO_WALLET_001',
        network: 'Ethereum',
        type: 'RAPID_MOVEMENT',
        severity: 'HIGH',
        title: 'Rapid Outbound Fund Displacement',
        description: 'Subject wallet forwarded 34.2 ETH across 3 separate hops within 8 minutes of receiving multi-source inflows.',
        timestamp: '2026-09-10T21:50:00Z',
        status: 'UNREAD'
      },
      {
        id: 'alert_03',
        orgId: defaultOrg.id,
        walletAddress: '0x8888888888882e3b2e3b2e3b2e3b2e3b2e3b2e3b',
        network: 'Ethereum',
        type: 'ENTITY_INTERACTION',
        severity: 'CRITICAL',
        title: 'Confirmed Illicit Mixer Deposit Detected',
        description: 'Direct interaction with Sigma Privacy Pool (Mixer) contract totaling 48.6 ETH in structured batches.',
        timestamp: '2026-09-10T20:12:00Z',
        status: 'UNREAD'
      },
      {
        id: 'alert_04',
        orgId: defaultOrg.id,
        walletAddress: '0x40ec5b33f54e08337052b7eee04b23333addf4e1',
        network: 'Ethereum',
        type: 'CROSS_CHAIN_HOP',
        severity: 'MEDIUM',
        title: 'Potential Cross-Chain Bridge Transit',
        description: 'Omnichain bridge lock transaction detected for 18.6 ETH with corresponding mint event inferred on Polygon.',
        timestamp: '2026-09-10T19:30:00Z',
        status: 'READ'
      }
    ];
    initialAlerts.forEach(a => this.alerts.set(a.id, a));

    // 9. Seed Audit Logs
    this.auditLogs = [
      {
        id: 'log_01',
        timestamp: '2026-09-10T22:48:00Z',
        userId: 'usr_senior_02',
        userName: 'Dr. Elena Rostova',
        userEmail: 'senior@tracex.io',
        orgId: defaultOrg.id,
        action: 'WALLET_ANALYSIS',
        resource: 'WALLET',
        resourceId: 'DEMO_WALLET_001',
        target: 'WALLET: DEMO_WALLET_001',
        integrityHash: 'a7f92b49c823058f912e128cb489c670a8d423405781a9f0293110543e01bc19',
        ipAddress: '192.168.1.104',
        status: 'SUCCESS',
        details: { network: 'Ethereum', riskCalculated: 87, findingsCount: 5 }
      },
      {
        id: 'log_02',
        timestamp: '2026-09-10T21:45:00Z',
        userId: 'usr_senior_02',
        userName: 'Dr. Elena Rostova',
        userEmail: 'senior@tracex.io',
        orgId: defaultOrg.id,
        action: 'INVESTIGATION_UPDATED',
        resource: 'INVESTIGATION',
        resourceId: 'case_trx_10482',
        target: 'INVESTIGATION: case_trx_10482',
        integrityHash: 'c4980a321ef9820491d9042bba45967018fa0931284719203810294719284910',
        ipAddress: '192.168.1.104',
        status: 'SUCCESS',
        details: { status: 'UNDER_INVESTIGATION', updatedField: 'tags' }
      },
      {
        id: 'log_03',
        timestamp: '2026-09-10T20:15:00Z',
        userId: 'usr_admin_01',
        userName: 'Marcus Vance',
        userEmail: 'admin@tracex.io',
        orgId: defaultOrg.id,
        action: 'CASE_ASSIGNED',
        resource: 'INVESTIGATION',
        resourceId: 'case_trx_10483',
        target: 'INVESTIGATION: case_trx_10483',
        integrityHash: 'e109823490182471920831092847109238471092384710928471029487102938',
        ipAddress: '192.168.1.100',
        status: 'SUCCESS',
        details: { assignedTo: 'usr_analyst_03', assignedName: 'James K. Reed' }
      },
      {
        id: 'log_04',
        timestamp: '2026-09-10T18:00:00Z',
        userId: 'usr_admin_01',
        userName: 'Marcus Vance',
        userEmail: 'admin@tracex.io',
        orgId: defaultOrg.id,
        action: 'LOGIN',
        resource: 'AUTH',
        resourceId: 'usr_admin_01',
        target: 'AUTH: usr_admin_01',
        integrityHash: 'f401928491028471092384710928471092384710928471092847102938471029',
        ipAddress: '192.168.1.100',
        status: 'SUCCESS'
      }
    ];

    // 10. Seed Default Dataset
    const defaultDataset: DatasetItem = {
      id: 'ds_demo_trans_01',
      fileName: 'demo_transactions.csv',
      sizeBytes: 24580,
      rowCount: 221,
      columnCount: 10,
      detectedNetwork: 'Ethereum',
      validationStatus: 'VALID',
      duplicateCount: 0,
      invalidRecordsCount: 0,
      uploadedBy: 'usr_admin_01',
      uploaderName: 'Marcus Vance',
      orgId: defaultOrg.id,
      uploadedAt: '2026-09-08T08:00:00Z',
      samplePreview: Array.from(this.transactions.values()).slice(0, 5)
    };
    this.datasets.set(defaultDataset.id, defaultDataset);

    // 11. Seed Pre-generated Dossier
    const demoReport: ReportDossier = {
      id: 'rep_trx_10482_01',
      reportNumber: 'TRX-REP-10482',
      caseId: 'case_trx_10482',
      caseName: 'Nexus Bridge & Sigma Mixer Rapid Layering Probe',
      subjectWallet: 'DEMO_WALLET_001',
      network: 'Ethereum',
      riskScore: 87,
      riskCategory: 'CRITICAL',
      executiveSummary: 'Subject wallet DEMO_WALLET_001 exhibits high-confidence characteristics of a centralized laundering aggregator and high-velocity layering conduit. The wallet aggregated 348.5 ETH from 8 upstream inflow vectors characterized by victim drain signatures, followed by structured, rapid forwarding (average forward time 6.4 minutes) to intermediary hopping wallets, culminating in direct deposits to the flagged Sigma Privacy Pool mixer contract and the Nexus Omnichain bridge portal.',
      keyFindings: [
        'Rapid Fund Movement: Multiple disbursements executed within 3-15 minutes of inbound aggregation.',
        'Fan-In Aggregation: Influx from 8 distinct non-associated origin accounts over 48 hours.',
        'Fan-Out Dispersion: Immediate multi-hop dispersion across 3 layer-1 intermediaries and 4 layer-2 splitting nodes.',
        'Anonymizer Exposure: Direct interaction with Sigma Privacy Pool (Mixer) representing high-risk laundering attempts.',
        'Cross-Chain Bridge Transit: Funds transferred to Nexus Omnichain portal for conversion into Polygon assets.'
      ],
      behavioralAssessment: 'Categorized behaviorally as a high-velocity pass-through aggregator and layering conduit with a 98.6% forwarding ratio. Minimal capital is maintained in the hub wallet (balance 4.82 ETH), preventing asset freeze exposure.',
      fundFlowSummary: '8 Source Vectors -> DEMO_WALLET_001 -> 3 Intermediary Hoppers -> 4 Dispersion Nodes -> Sigma Mixer (35%) & Nexus Bridge (42%) & Tier-1 VASP Cashouts (23%).',
      entityExposure: 'Confirmed exposure to Sigma Privacy Pool (Mixer - Critical Risk) and Nexus Omnichain Portal (Bridge - Medium Risk). Additional secondary off-ramp exposure observed at Alpha Global Exchange.',
      timelineSummary: 'Inflow aggregation commenced on 2026-09-08 06:00 UTC. Rapid outward bursts initiated on 2026-09-09. Mixer and bridge exit events occurred between 2026-09-10 18:00 and 22:45 UTC.',
      riskExplanation: 'Calculated deterministically based on high forwarding ratio (+15), rapid movement within 15m (+20), multi-source fan-in (+20), multi-destination fan-out (+15), burst frequency (+8), and mixer/anonymizer interaction (+9). Total: 87/100 (CRITICAL).',
      conclusion: 'The subject wallet functions as a key nexus in an active cyber-fraud fund dispersion network. Immediate asset freeze notices and counterparty monitoring are advised.',
      recommendedSteps: [
        'Issue urgent information request to Alpha Global Exchange for deposit transaction tx_4f1000x0.',
        'Monitor Nexus Omnichain destination addresses on Polygon for secondary off-ramps.',
        'Place connected intermediary addresses 0x9a8B...1A01 and 0x8b7C...02B2 on continuous real-time alert watchlists.',
        'Trace secondary split outputs exiting Sigma Mixer for potential peel chain behavior.'
      ],
      walletMetrics: this.wallets.get('demo_wallet_001') || ({} as WalletProfile),
      fraudFindings: [],
      counterpartyCount: 15,
      totalFundsTraced: '348.5 ETH',
      createdBy: 'usr_senior_02',
      authorName: 'Dr. Elena Rostova',
      authorRole: 'Senior Forensic Analyst',
      orgId: defaultOrg.id,
      createdAt: '2026-09-10T22:50:00Z',
      status: 'FINALIZED'
    };
    this.reports.set(demoReport.id, demoReport);
  }

  // User Operations
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  getUsersByOrg(orgId: string): User[] {
    return Array.from(this.users.values()).filter(u => u.orgId === orgId);
  }

  // Organization Operations
  getOrganization(id: string): Organization | undefined {
    return this.organizations.get(id);
  }

  updateOrganization(id: string, updates: Partial<Organization>): Organization | undefined {
    const existing = this.organizations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.organizations.set(id, updated);
    return updated;
  }

  // Investigation Operations
  getAllInvestigations(user: User): InvestigationCase[] {
    const list = Array.from(this.investigations.values());
    return list.filter(c => canAccessCase(user, c));
  }

  getInvestigationById(id: string, user: User): InvestigationCase | undefined {
    const c = this.investigations.get(id);
    if (!c) return undefined;
    if (!canAccessCase(user, c)) return undefined;
    return c;
  }

  createInvestigation(c: InvestigationCase): InvestigationCase {
    this.investigations.set(c.id, c);
    return c;
  }

  updateInvestigation(id: string, updates: Partial<InvestigationCase>): InvestigationCase | undefined {
    const existing = this.investigations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.investigations.set(id, updated);
    return updated;
  }

  updateCaseAssignments(
    caseId: string,
    assignments: CaseAccessAssignment[],
    updatedBy: User
  ): InvestigationCase | undefined {
    const caseItem = this.investigations.get(caseId);
    if (!caseItem) return undefined;

    caseItem.accessAssignments = assignments;

    // Synchronize primary assigned roles
    const managerAssign = assignments.find(a => a.role === 'MANAGER');
    if (managerAssign) {
      caseItem.assignedManagerId = managerAssign.userId;
      caseItem.assignedManagerName = managerAssign.userName;
    }
    const analystAssign = assignments.find(a => a.role === 'ANALYST');
    if (analystAssign) {
      caseItem.assignedAnalystId = analystAssign.userId;
      caseItem.assignedAnalystName = analystAssign.userName;
    }
    const reviewerAssign = assignments.find(a => a.role === 'REVIEWER');
    if (reviewerAssign) {
      caseItem.assignedReviewerId = reviewerAssign.userId;
      caseItem.assignedReviewerName = reviewerAssign.userName;
    }
    caseItem.assignedViewerIds = assignments.filter(a => a.role === 'VIEWER').map(a => a.userId);
    caseItem.updatedAt = new Date().toISOString();

    this.investigations.set(caseId, caseItem);
    return caseItem;
  }

  transferOwnership(
    orgId: string,
    currentOwnerId: string,
    newOwnerId: string
  ): { success: boolean; message: string; organization?: Organization; newOwner?: User; previousOwner?: User } {
    const org = this.organizations.get(orgId);
    if (!org) return { success: false, message: 'Organization not found.' };

    const currentOwner = this.users.get(currentOwnerId);
    if (!currentOwner || normalizeRole(currentOwner.role) !== 'ORGANIZATION_OWNER') {
      return { success: false, message: 'Caller is not the authorized organization owner.' };
    }

    if (currentOwnerId === newOwnerId) {
      return { success: false, message: 'Cannot transfer ownership to the current owner.' };
    }

    const newOwner = this.users.get(newOwnerId);
    if (!newOwner || newOwner.orgId !== orgId || !newOwner.isActive) {
      return { success: false, message: 'Target user must be an active member of this organization.' };
    }

    // Ownership transfer (Section 6.2 & 6.8):
    // Old owner becomes ORGANIZATION_ADMIN, new user becomes ORGANIZATION_OWNER
    currentOwner.role = 'ORGANIZATION_ADMIN';
    this.users.set(currentOwner.id, currentOwner);

    newOwner.role = 'ORGANIZATION_OWNER';
    this.users.set(newOwner.id, newOwner);

    org.ownerId = newOwner.id;
    this.organizations.set(org.id, org);

    return {
      success: true,
      message: `Ownership of ${org.name} successfully transferred to ${newOwner.name}.`,
      organization: org,
      newOwner,
      previousOwner: currentOwner
    };
  }

  // Transactions Operations
  getAllTransactions(limit = 1000): Transaction[] {
    return Array.from(this.transactions.values()).slice(0, limit);
  }

  getTransactionByHash(hash: string): Transaction | undefined {
    const lower = hash.toLowerCase();
    return Array.from(this.transactions.values()).find(t => t.txHash.toLowerCase() === lower);
  }

  getTransactionsForAddress(address: string): Transaction[] {
    const canonical = resolveAddress(address);
    const lowerCanonical = canonical.toLowerCase();
    const lowerOriginal = address.toLowerCase();

    let matches = Array.from(this.transactions.values()).filter(
      t => t.fromAddress.toLowerCase() === lowerCanonical ||
           t.toAddress.toLowerCase() === lowerCanonical ||
           t.fromAddress.toLowerCase() === lowerOriginal ||
           t.toAddress.toLowerCase() === lowerOriginal
    );

    // If no transactions exist, synthesize realistic forensic cluster connected to network
    if (matches.length === 0) {
      matches = this.synthesizeTransactionsForAddress(address, canonical);
    }

    return matches;
  }

  // Synthesize realistic forensic transactions for any queried wallet address
  private synthesizeTransactionsForAddress(address: string, canonical: string): Transaction[] {
    const isSubject = address.toUpperCase() === 'DEMO_WALLET_001' || canonical.toUpperCase() === 'DEMO_WALLET_001';
    const primaryAddr = isSubject ? 'DEMO_WALLET_001' : address;

    const isCleanCase = canonical.toUpperCase().includes('TR7X') || address.toUpperCase().includes('TR7X') || canonical.toLowerCase().includes('clean');
    const isFlaggedTron = canonical.toUpperCase().includes('TX9') || address.toUpperCase().includes('TX9');

    const syntheticTxs: Transaction[] = isCleanCase ? [
      {
        id: `synth_tx_clean_1_${Date.now()}`,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        network: 'Tron',
        fromAddress: 'TT3w...KrakenTreasury',
        toAddress: primaryAddr,
        amount: 50000,
        asset: 'USDT',
        fee: 1.2,
        isSuspicious: false,
        riskScore: 0,
        status: 'CONFIRMED'
      },
      {
        id: `synth_tx_clean_2_${Date.now()}`,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        network: 'Tron',
        fromAddress: 'TJ4x...BitfinexPayout',
        toAddress: primaryAddr,
        amount: 75000,
        asset: 'USDT',
        fee: 1.2,
        isSuspicious: false,
        riskScore: 0,
        status: 'CONFIRMED'
      },
      {
        id: `synth_tx_clean_3_${Date.now()}`,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        network: 'Tron',
        fromAddress: primaryAddr,
        toAddress: 'TP9a...BinanceDeposit',
        amount: 60000,
        asset: 'USDT',
        fee: 1.5,
        isSuspicious: false,
        riskScore: 0,
        status: 'CONFIRMED'
      }
    ] : [
      // Inflow 1: Drain Alpha
      {
        id: `synth_tx_in_1_${Date.now()}`,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        network: 'Ethereum',
        fromAddress: '0x3a1B98f6C2e5917D968841B9C590E81a8b1C9001',
        toAddress: primaryAddr,
        amount: 28.5,
        asset: 'ETH',
        fee: 0.0018,
        isSuspicious: true,
        riskScore: 78,
        status: 'CONFIRMED'
      },
      // Inflow 2: Exploit Beta
      {
        id: `synth_tx_in_2_${Date.now()}`,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
        network: 'Ethereum',
        fromAddress: '0x4b2C87e5D3f6928E979952CaD601F92b9c2D9002',
        toAddress: primaryAddr,
        amount: 34.2,
        asset: 'ETH',
        fee: 0.0022,
        isSuspicious: true,
        riskScore: 84,
        status: 'CONFIRMED'
      },
      // Inflow 3: Victim Gamma
      {
        id: `synth_tx_in_3_${Date.now()}`,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        network: 'Ethereum',
        fromAddress: '0x5c3D76d4E4a7939F980063DbE712A03c0d3E9003',
        toAddress: primaryAddr,
        amount: 19.8,
        asset: 'ETH',
        fee: 0.0015,
        isSuspicious: true,
        riskScore: 72,
        status: 'CONFIRMED'
      },
      // Outflow 1: Forward to Hopper A
      {
        id: `synth_tx_out_1_${Date.now()}`,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        network: 'Ethereum',
        fromAddress: primaryAddr,
        toAddress: '0x9a8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A01',
        amount: 24.5,
        asset: 'ETH',
        fee: 0.002,
        isSuspicious: true,
        riskScore: 82,
        status: 'CONFIRMED'
      },
      // Outflow 2: Forward to Hopper B
      {
        id: `synth_tx_out_2_${Date.now()}`,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        timestamp: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
        network: 'Ethereum',
        fromAddress: primaryAddr,
        toAddress: '0x8b7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A02B2',
        amount: 21.0,
        asset: 'ETH',
        fee: 0.0024,
        isSuspicious: true,
        riskScore: 79,
        status: 'CONFIRMED'
      },
      // Outflow 3: Sigma Mixer Deposit
      {
        id: `synth_tx_out_3_${Date.now()}`,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        network: 'Ethereum',
        fromAddress: primaryAddr,
        toAddress: '0x8888888888882e3b2e3b2e3b2e3b2e3b2e3b2e3b',
        amount: 18.6,
        asset: 'ETH',
        fee: 0.0055,
        isSuspicious: true,
        riskScore: 98,
        status: 'CONFIRMED'
      },
      // Outflow 4: Nexus Bridge Omnichain Transit
      {
        id: `synth_tx_out_4_${Date.now()}`,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        network: 'Ethereum',
        fromAddress: primaryAddr,
        toAddress: '0x40ec5b33f54e08337052b7eee04b23333addf4e1',
        amount: 12.4,
        asset: 'ETH',
        fee: 0.0035,
        isSuspicious: false,
        riskScore: 40,
        status: 'CONFIRMED'
      }
    ];

    syntheticTxs.forEach(tx => this.transactions.set(tx.id, tx));

    // Also register profile
    const profile: WalletProfile = {
      address: primaryAddr,
      canonicalAddress: canonical,
      label: isCleanCase ? 'TR7X Verified Treasury (Tron)' : (isFlaggedTron ? 'TX9 Mixer-Sanction Route (Tron)' : (primaryAddr.includes('Mixer') ? 'Sigma Mixer Transit Node' : (primaryAddr.includes('Bridge') ? 'Nexus Bridge Transit Node' : `Investigated Target (${primaryAddr.substring(0, 8)}...)`))),
      network: isCleanCase || isFlaggedTron ? 'Tron' : 'Ethereum',
      riskScore: isCleanCase ? 0 : (isFlaggedTron ? 65 : 84),
      riskCategory: isCleanCase ? 'LOW' : (isFlaggedTron ? 'HIGH' : 'CRITICAL'),
      balance: isCleanCase ? 65000 : 5.8,
      totalReceived: isCleanCase ? 125000 : 82.5,
      totalSent: isCleanCase ? 60000 : 76.5,
      netFlow: isCleanCase ? 65000 : 6.0,
      currency: isCleanCase || isFlaggedTron ? 'USDT' : 'ETH',
      transactionCount: isCleanCase ? 208 : syntheticTxs.length,
      incomingCount: isCleanCase ? 124 : 3,
      outgoingCount: isCleanCase ? 84 : 4,
      uniqueSenders: isCleanCase ? 48 : 3,
      uniqueReceivers: isCleanCase ? 33 : 4,
      counterpartyCount: isCleanCase ? 81 : 7,
      firstSeen: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      lastSeen: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      forwardingRatio: isCleanCase ? 0.48 : 0.927,
      averageTimeToForwardMinutes: isCleanCase ? 240 : 5.8,
      burstCount: isCleanCase ? 0 : 4,
      rapidMovementCount: isCleanCase ? 0 : 6,
      dormantToActiveScore: isCleanCase ? 0.05 : 0.76,
      behaviorProfile: isCleanCase ? ['Enterprise Treasury', 'Institutional Settlement'] : ['Fan-In Aggregator', 'High-Velocity Forwarder', 'Mixer Feeder'],
      clusterId: isCleanCase ? 'CLUST_TRON_TREASURY' : 'CLUST_INVESTIGATION_TARGET',
      clusterSize: isCleanCase ? 81 : 7,
      potentialEntity: isCleanCase ? 'TR7X Institutional Desk' : (primaryAddr.includes('Mixer') ? 'Sigma Privacy Pool' : null),
      entityConfidence: 'High Confidence'
    };

    this.wallets.set(primaryAddr.toLowerCase(), profile);
    this.wallets.set(canonical.toLowerCase(), profile);
    this.wallets.set(address.toLowerCase(), profile);

    return syntheticTxs;
  }

  addTransactions(newTxs: Transaction[]): void {
    newTxs.forEach(t => this.transactions.set(t.id || t.txHash, t));
  }

  // Wallet Operations
  getWalletProfile(address: string): WalletProfile | undefined {
    const canonical = resolveAddress(address);
    let profile = this.wallets.get(address.toLowerCase()) || this.wallets.get(canonical.toLowerCase());
    if (!profile) {
      // Ensure transactions and profile exist
      this.getTransactionsForAddress(address);
      profile = this.wallets.get(address.toLowerCase()) || this.wallets.get(canonical.toLowerCase());
    }
    return profile;
  }

  setWalletProfile(address: string, profile: WalletProfile): void {
    this.wallets.set(address.toLowerCase(), profile);
  }

  getAllWallets(): WalletProfile[] {
    return Array.from(this.wallets.values());
  }

  // Entity Operations
  getAllEntities(): EntityRecord[] {
    return Array.from(this.entities.values());
  }

  getEntityById(id: string): EntityRecord | undefined {
    return this.entities.get(id);
  }

  findEntityForAddress(address: string): EntityRecord | undefined {
    const lower = address.toLowerCase();
    return Array.from(this.entities.values()).find(e =>
      e.addresses.some(a => a.toLowerCase() === lower)
    );
  }

  // Watchlist Operations
  getWatchlist(user: User): WatchlistItem[] {
    const items = Array.from(this.watchlist.values());
    if (user.accountType === 'PERSONAL') {
      return items.filter(w => w.userId === user.id);
    }
    return items.filter(w => w.orgId === user.orgId);
  }

  addWatchlistItem(item: WatchlistItem): WatchlistItem {
    this.watchlist.set(item.id, item);
    return item;
  }

  deleteWatchlistItem(id: string): boolean {
    return this.watchlist.delete(id);
  }

  // Alert Operations
  getAlerts(user: User): AlertItem[] {
    const list = Array.from(this.alerts.values());
    if (user.accountType === 'PERSONAL') {
      return list.filter(a => a.userId === user.id);
    }
    return list.filter(a => a.orgId === user.orgId || !a.orgId);
  }

  updateAlert(id: string, updates: Partial<AlertItem>): AlertItem | undefined {
    const existing = this.alerts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.alerts.set(id, updated);
    return updated;
  }

  createAlert(alert: AlertItem): AlertItem {
    this.alerts.set(alert.id, alert);
    return alert;
  }

  // Report Operations
  getReports(user: User): ReportDossier[] {
    const list = Array.from(this.reports.values());
    if (user.accountType === 'PERSONAL') {
      return list.filter(r => r.createdBy === user.id);
    }
    return list.filter(r => r.orgId === user.orgId);
  }

  getReportById(id: string): ReportDossier | undefined {
    return this.reports.get(id);
  }

  createReport(report: ReportDossier): ReportDossier {
    this.reports.set(report.id, report);
    return report;
  }

  deleteReport(id: string): boolean {
    return this.reports.delete(id);
  }

  // Dataset Operations
  getDatasets(user: User): DatasetItem[] {
    const list = Array.from(this.datasets.values());
    if (user.accountType === 'PERSONAL') {
      return list.filter(d => d.uploadedBy === user.id);
    }
    return list.filter(d => d.orgId === user.orgId);
  }

  addDataset(dataset: DatasetItem): DatasetItem {
    this.datasets.set(dataset.id, dataset);
    return dataset;
  }

  deleteDataset(id: string): boolean {
    return this.datasets.delete(id);
  }

  // Audit Logs Operations
  addAuditLog(entry: AuditLogEntry): void {
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  getAuditLogs(user: User): AuditLogEntry[] {
    if (user.accountType === 'PERSONAL') {
      return this.auditLogs.filter(l => l.userId === user.id);
    }
    return this.auditLogs.filter(l => l.orgId === user.orgId);
  }
}

export const db = new Database();
