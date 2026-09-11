import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db, hashPassword, verifyPassword, resolveAddress } from './database';
import { authMiddleware, generateToken, revokeToken, AuthenticatedRequest, requireOrgAdmin, requireAuth } from './auth';
import { AnalyticsEngine } from './analyticsEngine';
import { RiskEngine } from './riskEngine';
import { FraudDetectionEngine } from './fraudDetection';
import { GraphAnalyticsEngine } from './graphAnalytics';
import { AttributionEngine } from './attribution';
import { WalletClusteringEngine } from './walletClustering';
import { CrossChainEngine } from './crossChain';
import { AIIntelligenceEngine } from './aiIntelligence';
import { AuditLogger } from './auditLogger';
import { DiagnosticsEngine } from './diagnostics';
import { User, InvestigationCase, Transaction, WatchlistItem, AlertItem, ReportDossier, DatasetItem, UserRole } from './types';

export const apiRouter = Router();

// Apply auth middleware to all api routes
apiRouter.use(authMiddleware);

// ============================================================
// AUTHENTICATION ENDPOINTS
// ============================================================

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { email, name, password, confirmPassword, accountType = 'PERSONAL', orgName, department } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const normalizedEmail = (email as string).trim().toLowerCase();
  const existing = db.getUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  let orgId: string | undefined;
  let userRole: UserRole = 'ANALYST';

  if (accountType === 'BUSINESS' || accountType === 'ORGANIZATION') {
    const org = {
      id: `org_${Date.now()}`,
      name: orgName?.trim() || `${name}'s Organization`,
      code: `TRX-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      createdAt: new Date().toISOString(),
      plan: 'ENTERPRISE' as const,
      settings: {
        defaultNetwork: 'Ethereum',
        riskThreshold: 70,
        autoAlerts: true,
        requireCaseMFA: false
      }
    };
    db.updateOrganization(org.id, org);
    orgId = org.id;
    userRole = 'ADMIN';
  } else {
    // Normal user cannot register themselves as ADMIN
    userRole = 'PERSONAL_INVESTIGATOR';
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    email: normalizedEmail,
    name,
    passwordHash: hashPassword(password),
    accountType: (accountType === 'BUSINESS' || accountType === 'ORGANIZATION') ? 'ORGANIZATION' : 'PERSONAL',
    role: userRole,
    orgId,
    orgName: orgName || undefined,
    department: department || (accountType === 'ORGANIZATION' ? 'Forensic Unit' : 'Independent Research'),
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  db.createUser(newUser);
  const token = generateToken(newUser.id);

  AuditLogger.logAuthEvent('LOGIN_SUCCESS', normalizedEmail, 'SUCCESS', {
    action: 'REGISTER',
    role: newUser.role,
    accountType: newUser.accountType
  }, newUser);

  const { passwordHash, ...userSafe } = newUser;
  return res.status(201).json({
    access_token: token,
    token,
    user: {
      ...userSafe,
      organization_id: userSafe.orgId
    }
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    AuditLogger.logAuthEvent('LOGIN_FAILURE', email || 'empty', 'FAILURE', { reason: 'Missing email or password' });
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = (email as string).trim().toLowerCase();
  const user = db.getUserByEmail(normalizedEmail);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    AuditLogger.logAuthEvent('LOGIN_FAILURE', normalizedEmail, 'FAILURE', { reason: 'Invalid credentials' });
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    AuditLogger.logAuthEvent('ACCOUNT_DISABLED', normalizedEmail, 'WARNING', { userId: user.id }, user);
    return res.status(403).json({ error: 'Your TRACE-X account has been disabled. Contact an administrator.' });
  }

  // Role validation
  if (role) {
    const normalizeRole = (r: string) => r.trim().toUpperCase().replace(/[\s-]+/g, '_');
    const requestedRole = normalizeRole(role);
    const actualRole = normalizeRole(user.role);

    if (requestedRole !== actualRole) {
      AuditLogger.logAuthEvent('ROLE_MISMATCH', normalizedEmail, 'FAILURE', {
        requestedRole: role,
        actualRole: user.role,
        userId: user.id
      }, user);
      return res.status(403).json({
        error: 'Role mismatch. Please select the role associated with this account.',
        code: 'ROLE_MISMATCH'
      });
    }
  }

  db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });
  const token = generateToken(user.id);

  AuditLogger.logAuthEvent('LOGIN_SUCCESS', normalizedEmail, 'SUCCESS', {
    role: user.role,
    accountType: user.accountType,
    orgId: user.orgId
  }, user);

  const { passwordHash, ...userSafe } = user;
  return res.json({
    access_token: token,
    token,
    user: {
      ...userSafe,
      organization_id: userSafe.orgId
    }
  });
});

apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const normalizedEmail = (email as string).trim().toLowerCase();
  const user = db.getUserByEmail(normalizedEmail);

  AuditLogger.logAuthEvent('PASSWORD_RESET_REQUEST', normalizedEmail, 'SUCCESS', {
    accountFound: !!user
  }, user);

  return res.json({
    message: 'If an account associated with that email exists, reset instructions have been dispatched.',
    devNote: 'Development Notice: Password reset request recorded. Development accounts use the documented demo password.'
  });
});

apiRouter.post('/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'] as string;
  }

  if (token) {
    revokeToken(token);
  }

  if (req.user) {
    AuditLogger.logAuthEvent('LOGOUT', req.user.email, 'SUCCESS', {}, req.user);
  } else {
    AuditLogger.logAuthEvent('LOGOUT', 'unknown', 'SUCCESS');
  }

  return res.json({ message: 'Logged out successfully.' });
});

apiRouter.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { passwordHash, ...userSafe } = req.user;
  return res.json({
    user: {
      ...userSafe,
      organization_id: userSafe.orgId
    }
  });
});

// ============================================================
// DASHBOARD KPIS
// ============================================================

apiRouter.get('/kpis', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const investigations = db.getAllInvestigations(user);
  const allWallets = db.getAllWallets();
  const allTxs = db.getAllTransactions(1000);
  const watchlist = db.getWatchlist(user);

  const activeInvestigations = investigations.filter(c => c.status === 'UNDER_INVESTIGATION' || c.status === 'NEW').length;
  const criticalHighRiskWallets = allWallets.filter(w => w.riskScore >= 70).length;
  const suspiciousTxs = allTxs.filter(t => t.isSuspicious).length;
  const monitoredWallets = watchlist.length;

  let fundsTraced = 0;
  investigations.forEach(c => {
    fundsTraced += c.fundTracedAmount || 0;
  });
  if (fundsTraced === 0) fundsTraced = 1198.4;

  return res.json({
    activeInvestigations,
    criticalHighRiskWallets,
    suspiciousTxs,
    fundsTraced: `${fundsTraced.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ETH`,
    monitoredWallets
  });
});

// ============================================================
// WALLET ANALYSIS WORKFLOW (CORE INVESTIGATION ENDPOINT)
// ============================================================

apiRouter.post('/wallet/analyze', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { address, network = 'Ethereum' } = req.body;
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a valid cryptocurrency wallet address or identifier.' });
    }

    const cleanAddress = address.trim();
    const resolvedAddress = resolveAddress(cleanAddress);
    const user = req.user || {
      id: 'usr_public_trace',
      name: 'Public Recon Explorer',
      email: 'explorer@tracex.io',
      role: 'ANALYST' as UserRole,
      accountType: 'PERSONAL' as const,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    // 1. Fetch or generate transaction history
    let txs = db.getTransactionsForAddress(cleanAddress);
    if (txs.length === 0 && resolvedAddress.toLowerCase() !== cleanAddress.toLowerCase()) {
      txs = db.getTransactionsForAddress(resolvedAddress);
    }

    // 2. Behavioral feature extraction
    const features = AnalyticsEngine.extractFeatures(cleanAddress, network, txs);

    // 3. Explainable Risk Score calculation
    const risk = RiskEngine.calculateScore(features);

    // 4. Fraud Pattern Detection
    const fraudFindings = FraudDetectionEngine.detectPatterns(features, txs);

    // 5. Multi-hop Graph Generation
    const graph = GraphAnalyticsEngine.buildGraph(cleanAddress, 3, 'ALL');

    // 6. Entity & VASP Attribution
    const attribution = AttributionEngine.matchAddress(cleanAddress) || AttributionEngine.matchAddress(resolvedAddress);

    // 7. Wallet Clustering
    const clusters = WalletClusteringEngine.getClusters(cleanAddress);

    // 8. Cross-Chain Detection
    const crossChainTransfers = CrossChainEngine.getTransfers();

    // 9. Structured AI Intelligence Synthesis
    const walletProfile = {
      ...features,
      balance: features.currentBalance,
      address: cleanAddress,
      canonicalAddress: resolvedAddress,
      riskScore: risk.score,
      riskCategory: risk.category,
      potentialEntity: attribution?.entity ? attribution.entity.name : (cleanAddress.toLowerCase().includes('mixer') ? 'Sigma Privacy Pool' : null),
      entityConfidence: attribution?.attributionConfidence || (cleanAddress.toLowerCase().includes('mixer') ? 'High Confidence' : null)
    };

    const aiIntelligence = await AIIntelligenceEngine.generateIntelligence(
      walletProfile as any,
      risk,
      fraudFindings,
      graph
    );

    // 10. Assemble complete investigation payload
    const timeline = txs.slice(0, 30).map(t => {
      const isOut = t.fromAddress.toLowerCase() === cleanAddress.toLowerCase();
      return {
        id: t.id,
        txHash: t.txHash,
        timestamp: t.timestamp,
        event: isOut ? `Dispatched ${t.amount} ${t.asset} to ${t.toAddress.substring(0, 10)}...` : `Received ${t.amount} ${t.asset} from ${t.fromAddress.substring(0, 10)}...`,
        wallet: isOut ? t.toAddress : t.fromAddress,
        amount: t.amount,
        asset: t.asset,
        risk: t.riskScore,
        isSuspicious: t.isSuspicious,
        direction: isOut ? 'OUTGOING' : 'INCOMING'
      };
    });

    // Update wallet profile in db
    db.setWalletProfile(cleanAddress, walletProfile as any);

    // Log audit action
    AuditLogger.log(user, 'WALLET_ANALYSIS', 'WALLET', cleanAddress, {
      network,
      riskScore: risk.score,
      findings: fraudFindings.length
    });

    return res.json({
      wallet: walletProfile,
      risk,
      fraudFindings,
      graph,
      attribution,
      clusters,
      crossChainTransfers,
      aiIntelligence,
      timeline
    });
  } catch (err: any) {
    console.error('Error during wallet analysis:', err);
    return res.status(500).json({ error: 'Unable to analyze wallet. Check the address and selected network.' });
  }
});

apiRouter.get('/wallet/:address', (req: Request, res: Response) => {
  const { address } = req.params;
  const profile = db.getWalletProfile(address);
  if (!profile) {
    const txs = db.getTransactionsForAddress(address);
    const features = AnalyticsEngine.extractFeatures(address, 'Ethereum', txs);
    const risk = RiskEngine.calculateScore(features);
    return res.json({ ...features, riskScore: risk.score, riskCategory: risk.category });
  }
  return res.json(profile);
});

apiRouter.get('/wallet/:address/transactions', (req: Request, res: Response) => {
  const { address } = req.params;
  const txs = db.getTransactionsForAddress(address);
  return res.json(txs);
});

apiRouter.get('/wallet/:address/risk', (req: Request, res: Response) => {
  const { address } = req.params;
  const txs = db.getTransactionsForAddress(address);
  const features = AnalyticsEngine.extractFeatures(address, 'Ethereum', txs);
  const risk = RiskEngine.calculateScore(features);
  return res.json(risk);
});

apiRouter.get('/wallet/:address/fraud', (req: Request, res: Response) => {
  const { address } = req.params;
  const txs = db.getTransactionsForAddress(address);
  const features = AnalyticsEngine.extractFeatures(address, 'Ethereum', txs);
  const findings = FraudDetectionEngine.detectPatterns(features, txs);
  return res.json(findings);
});

apiRouter.get('/wallet/:address/graph', (req: Request, res: Response) => {
  const { address } = req.params;
  const hops = parseInt(req.query.hops as string) || 3;
  const filter = (req.query.filter as string) || 'ALL';
  const graph = GraphAnalyticsEngine.buildGraph(address, hops, filter);
  return res.json(graph);
});

apiRouter.post('/graph/trace', (req: Request, res: Response) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'Wallet address is required.' });
  const trace = GraphAnalyticsEngine.traceMoneyFlow(address);
  return res.json(trace);
});

// ============================================================
// INVESTIGATIONS & CASE MANAGEMENT
// ============================================================

apiRouter.get('/investigations', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const cases = db.getAllInvestigations(user);
  return res.json(cases);
});

apiRouter.get('/investigations/:id', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const c = db.getInvestigationById(req.params.id, user);
  if (!c) {
    return res.status(404).json({ error: 'Investigation case not found or access denied.' });
  }
  return res.json(c);
});

apiRouter.post('/investigations', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { title, primaryWallet, network = 'Ethereum', notes, tags = [] } = req.body;

  if (!primaryWallet) {
    return res.status(400).json({ error: 'Primary wallet address is required.' });
  }

  const caseNum = `TRX-${Math.floor(10000 + Math.random() * 90000)}`;
  const txs = db.getTransactionsForAddress(primaryWallet);
  const features = AnalyticsEngine.extractFeatures(primaryWallet, network, txs);
  const risk = RiskEngine.calculateScore(features);

  const newCase: InvestigationCase = {
    id: `case_${Date.now()}`,
    caseNumber: caseNum,
    title: title || `Investigation of ${primaryWallet.substring(0, 10)}...`,
    primaryWallet,
    network,
    riskScore: risk.score,
    riskCategory: risk.category,
    status: 'UNDER_INVESTIGATION',
    assignedAnalystId: user.id,
    assignedAnalystName: user.name,
    creatorId: user.id,
    orgId: user.orgId,
    tags: tags.length > 0 ? tags : ['Active Forensic Trace', network],
    notes: notes || 'Automated case initiation from workspace screening.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fundTracedAmount: features.totalReceived,
    fundTracedCurrency: network === 'Polygon' ? 'MATIC' : 'ETH'
  };

  db.createInvestigation(newCase);
  AuditLogger.log(user, 'INVESTIGATION_CREATED', 'INVESTIGATION', newCase.id, {
    caseNumber: newCase.caseNumber,
    wallet: primaryWallet
  });

  return res.status(201).json(newCase);
});

apiRouter.put('/investigations/:id', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const existing = db.getInvestigationById(req.params.id, user);
  if (!existing) {
    return res.status(404).json({ error: 'Case not found or permission denied.' });
  }

  const updated = db.updateInvestigation(req.params.id, req.body);
  AuditLogger.log(user, 'INVESTIGATION_UPDATED', 'INVESTIGATION', req.params.id, req.body);
  return res.json(updated);
});

// ============================================================
// TRANSACTIONS EXPLORER
// ============================================================

apiRouter.get('/transactions', (req: Request, res: Response) => {
  const network = req.query.network as string;
  const asset = req.query.asset as string;
  const isSuspicious = req.query.suspicious === 'true';
  const search = (req.query.search as string || '').toLowerCase();
  const limit = parseInt(req.query.limit as string) || 100;
  const offset = parseInt(req.query.offset as string) || 0;

  let all = db.getAllTransactions(2000);

  if (network) {
    all = all.filter(t => t.network.toLowerCase() === network.toLowerCase());
  }
  if (asset) {
    all = all.filter(t => t.asset.toLowerCase() === asset.toLowerCase());
  }
  if (isSuspicious) {
    all = all.filter(t => t.isSuspicious);
  }
  if (search) {
    all = all.filter(t =>
      t.txHash.toLowerCase().includes(search) ||
      t.fromAddress.toLowerCase().includes(search) ||
      t.toAddress.toLowerCase().includes(search)
    );
  }

  const total = all.length;
  const paginated = all.slice(offset, offset + limit);

  return res.json({
    total,
    offset,
    limit,
    transactions: paginated
  });
});

apiRouter.get('/transactions/:hash', (req: Request, res: Response) => {
  const tx = db.getTransactionByHash(req.params.hash);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction hash not found.' });
  }
  return res.json(tx);
});

// ============================================================
// ENTITIES / VASP REGISTRY
// ============================================================

apiRouter.get('/entities', (_req: Request, res: Response) => {
  return res.json(db.getAllEntities());
});

apiRouter.get('/entities/:id', (req: Request, res: Response) => {
  const entity = db.getEntityById(req.params.id);
  if (!entity) return res.status(404).json({ error: 'Entity not found' });
  return res.json(entity);
});

// ============================================================
// CLUSTERS & CROSS-CHAIN
// ============================================================

apiRouter.get('/clusters', (req: Request, res: Response) => {
  const address = req.query.address as string;
  return res.json(WalletClusteringEngine.getClusters(address));
});

apiRouter.get('/cross-chain', (_req: Request, res: Response) => {
  return res.json(CrossChainEngine.getTransfers());
});

// ============================================================
// WATCHLIST
// ============================================================

apiRouter.get('/watchlist', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json(db.getWatchlist(user));
});

apiRouter.post('/watchlist', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { walletAddress, network = 'Ethereum', label, priority = 'HIGH' } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required.' });
  }

  const txs = db.getTransactionsForAddress(walletAddress);
  const features = AnalyticsEngine.extractFeatures(walletAddress, network, txs);
  const risk = RiskEngine.calculateScore(features);

  const item: WatchlistItem = {
    id: `watch_${Date.now()}`,
    userId: user.id,
    orgId: user.orgId,
    walletAddress,
    network,
    label: label || `Watchlist Target: ${walletAddress.substring(0, 8)}...`,
    priority,
    currentRiskScore: risk.score,
    previousRiskScore: risk.score,
    lastActivity: new Date().toISOString(),
    alertCount: 0,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };

  db.addWatchlistItem(item);
  AuditLogger.log(user, 'WATCHLIST_CREATED', 'WATCHLIST', item.id, { walletAddress });
  return res.status(201).json(item);
});

apiRouter.delete('/watchlist/:id', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  db.deleteWatchlistItem(req.params.id);
  AuditLogger.log(user, 'WATCHLIST_DELETED', 'WATCHLIST', req.params.id);
  return res.json({ message: 'Watchlist target removed.' });
});

// ============================================================
// ALERTS
// ============================================================

apiRouter.get('/alerts', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json(db.getAlerts(user));
});

apiRouter.put('/alerts/:id', (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateAlert(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Alert not found.' });
  return res.json(updated);
});

// ============================================================
// REPORTS & DOSSIERS
// ============================================================

apiRouter.get('/reports', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json(db.getReports(user));
});

apiRouter.get('/reports/:id', (req: Request, res: Response) => {
  const report = db.getReportById(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found.' });
  return res.json(report);
});

apiRouter.post('/reports', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { subjectWallet, network = 'Ethereum', caseId, caseName } = req.body;

  if (!subjectWallet) {
    return res.status(400).json({ error: 'Subject wallet is required to generate report.' });
  }

  const txs = db.getTransactionsForAddress(subjectWallet);
  const features = AnalyticsEngine.extractFeatures(subjectWallet, network, txs);
  const risk = RiskEngine.calculateScore(features);
  const fraudFindings = FraudDetectionEngine.detectPatterns(features, txs);
  const graph = GraphAnalyticsEngine.buildGraph(subjectWallet, 3, 'ALL');

  const walletProfile = {
    ...features,
    riskScore: risk.score,
    riskCategory: risk.category
  };

  const aiIntel = await AIIntelligenceEngine.generateIntelligence(
    walletProfile as any,
    risk,
    fraudFindings,
    graph
  );

  const reportNum = `TRX-REP-${Math.floor(10000 + Math.random() * 90000)}`;

  const newReport: ReportDossier = {
    id: `rep_${Date.now()}`,
    reportNumber: reportNum,
    caseId,
    caseName: caseName || `Forensic Dossier: ${subjectWallet.substring(0, 10)}...`,
    subjectWallet,
    network,
    riskScore: risk.score,
    riskCategory: risk.category,
    executiveSummary: aiIntel.executiveSummary,
    keyFindings: aiIntel.keyFindings,
    behavioralAssessment: aiIntel.behavioralAssessment,
    fundFlowSummary: aiIntel.fundFlowSummary,
    entityExposure: aiIntel.entityExposure,
    timelineSummary: aiIntel.timelineSummary,
    riskExplanation: aiIntel.riskExplanation,
    conclusion: aiIntel.conclusion,
    recommendedSteps: aiIntel.recommendedSteps,
    walletMetrics: walletProfile as any,
    fraudFindings,
    counterpartyCount: features.counterpartyCount,
    totalFundsTraced: `${features.totalReceived} ${features.network === 'Polygon' ? 'MATIC' : 'ETH'}`,
    createdBy: user.id,
    authorName: user.name,
    authorRole: user.role === 'ADMIN' ? 'Forensic Director' : user.role === 'SENIOR_ANALYST' ? 'Senior Forensic Analyst' : 'Cryptocurrency Analyst',
    orgId: user.orgId,
    createdAt: new Date().toISOString(),
    status: 'FINALIZED'
  };

  db.createReport(newReport);
  AuditLogger.log(user, 'REPORT_GENERATED', 'REPORT', newReport.id, {
    reportNumber: reportNum,
    subjectWallet
  });

  return res.status(201).json(newReport);
});

apiRouter.delete('/reports/:id', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  db.deleteReport(req.params.id);
  AuditLogger.log(user, 'REPORT_DELETED', 'REPORT', req.params.id);
  return res.json({ message: 'Report deleted.' });
});

// ============================================================
// DATASETS & INGESTION
// ============================================================

apiRouter.get('/datasets', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json(db.getDatasets(user));
});

apiRouter.post('/datasets/upload', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { fileName, csvContent } = req.body;

  if (!fileName || !csvContent) {
    return res.status(400).json({ error: 'File name and CSV content are required.' });
  }

  // Parse CSV content
  const lines = (csvContent as string).split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) {
    return res.status(400).json({ error: 'CSV file contains insufficient rows. Must include a header and records.' });
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rowCount = lines.length - 1;
  const newTransactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length >= 5) {
      newTransactions.push({
        id: `tx_csv_${Date.now()}_${i}`,
        timestamp: cols[0] || new Date().toISOString(),
        txHash: cols[1] || `0xhash${Date.now()}${i}`,
        network: cols[2] || 'Ethereum',
        fromAddress: cols[3] || '0xunknown_from',
        toAddress: cols[4] || '0xunknown_to',
        asset: cols[5] || 'ETH',
        amount: parseFloat(cols[6]) || 1.0,
        fee: parseFloat(cols[7]) || 0.002,
        status: 'CONFIRMED',
        isSuspicious: cols[8] === 'true' || parseFloat(cols[6]) > 20,
        riskScore: parseFloat(cols[9]) || 30
      });
    }
  }

  db.addTransactions(newTransactions);

  const datasetItem: DatasetItem = {
    id: `ds_${Date.now()}`,
    fileName,
    sizeBytes: Buffer.byteLength(csvContent, 'utf8'),
    rowCount,
    columnCount: headers.length,
    detectedNetwork: newTransactions[0]?.network || 'Ethereum',
    validationStatus: 'VALID',
    duplicateCount: 0,
    invalidRecordsCount: 0,
    uploadedBy: user.id,
    uploaderName: user.name,
    orgId: user.orgId,
    uploadedAt: new Date().toISOString(),
    samplePreview: newTransactions.slice(0, 5)
  };

  db.addDataset(datasetItem);
  AuditLogger.log(user, 'DATASET_UPLOADED', 'DATASET', datasetItem.id, {
    fileName,
    rowCount
  });

  return res.status(201).json({ dataset: datasetItem, importedCount: newTransactions.length });
});

apiRouter.delete('/datasets/:id', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  db.deleteDataset(req.params.id);
  AuditLogger.log(user, 'DATASET_DELETED', 'DATASET', req.params.id);
  return res.json({ message: 'Dataset removed.' });
});

// ============================================================
// ADMIN / EMPLOYEES & AUDIT LOGS
// ============================================================

apiRouter.get('/admin/employees', requireOrgAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const employees = db.getUsersByOrg(user.orgId!);
  const safeEmployees = employees.map(({ passwordHash, ...e }) => e);
  return res.json(safeEmployees);
});

apiRouter.get('/admin/organization', requireOrgAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const org = db.getOrganization(user.orgId || '');
  return res.json(org || {
    id: 'org_cyber_forensics_01',
    name: user.orgName || 'Vanguard Blockchain Intelligence Group',
    plan: 'ENTERPRISE',
    settings: {
      defaultNetwork: 'Ethereum',
      riskThreshold: 70,
      autoAlerts: true,
      requireCaseMFA: true
    }
  });
});

apiRouter.get(['/admin/case-assignment', '/admin/cases'], requireOrgAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const cases = db.getAllInvestigations(user);
  return res.json(cases);
});

apiRouter.get(['/admin/employee-activity', '/admin/activity'], requireOrgAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const logs = db.getAuditLogs(user);
  return res.json(logs);
});

apiRouter.get(['/admin/audit-logs'], requireOrgAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const logs = db.getAuditLogs(user);
  return res.json(logs);
});

apiRouter.get(['/admin/organization-settings', '/admin/settings'], requireOrgAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const org = db.getOrganization(user.orgId || '');
  return res.json(org?.settings || {
    defaultNetwork: 'Ethereum',
    riskThreshold: 70,
    autoAlerts: true,
    requireCaseMFA: true
  });
});

apiRouter.put(['/admin/organization-settings', '/admin/settings'], requireOrgAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const org = db.getOrganization(user.orgId || '');
  if (org) {
    org.settings = { ...org.settings, ...req.body };
    db.updateOrganization(org.id, org);
  }
  AuditLogger.log(user, 'ORG_SETTINGS_UPDATED', 'ORGANIZATION', user.orgId || 'org_main', req.body);
  return res.json({ message: 'Organization settings updated successfully.', settings: req.body });
});

apiRouter.post('/admin/employees', requireOrgAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { name, email, role, department } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An employee with this email already exists.' });
  }

  const newEmp: User = {
    id: `usr_${Date.now()}`,
    email,
    name,
    passwordHash: hashPassword('TraceX@2026'),
    accountType: 'ORGANIZATION',
    role,
    orgId: user.orgId,
    orgName: user.orgName,
    department: department || 'Cryptocurrency Intelligence Unit',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: 'Never'
  };

  db.createUser(newEmp);
  AuditLogger.log(user, 'EMPLOYEE_CREATED', 'USER', newEmp.id, { email, role });

  const { passwordHash, ...safe } = newEmp;
  return res.status(201).json(safe);
});

apiRouter.put('/admin/employees/:id', requireOrgAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { role, isActive, department } = req.body;
  const emp = db.getUserById(req.params.id);

  if (!emp || emp.orgId !== user.orgId) {
    return res.status(404).json({ error: 'Employee not found in your organization.' });
  }

  const updated = db.updateUser(req.params.id, {
    ...(role ? { role } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
    ...(department ? { department } : {})
  });

  AuditLogger.log(user, 'ROLE_CHANGED', 'USER', req.params.id, req.body);
  const { passwordHash, ...safe } = updated!;
  return res.json(safe);
});

apiRouter.delete('/admin/employees/:id', requireOrgAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const emp = db.getUserById(req.params.id);
  if (!emp || emp.orgId !== user.orgId) {
    return res.status(404).json({ error: 'Employee not found.' });
  }
  db.deleteUser(req.params.id);
  AuditLogger.log(user, 'EMPLOYEE_REMOVED', 'USER', req.params.id);
  return res.json({ message: 'Employee removed.' });
});

apiRouter.get('/audit-logs', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const logs = db.getAuditLogs(user);
  return res.json(logs);
});

// ============================================================
// PLATFORM DIAGNOSTICS
// ============================================================

apiRouter.get('/diagnostics', (_req: Request, res: Response) => {
  return res.json(DiagnosticsEngine.getSystemStatus());
});
