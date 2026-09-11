export type UserRole =
  | 'PERSONAL_USER'
  | 'ORGANIZATION_OWNER'
  | 'ORGANIZATION_ADMIN'
  | 'ORGANIZATION_MANAGER'
  | 'ORGANIZATION_ANALYST'
  | 'ORGANIZATION_REVIEWER'
  | 'ORGANIZATION_VIEWER'
  // Backward-compatibility aliases
  | 'ADMIN'
  | 'SENIOR_ANALYST'
  | 'ANALYST'
  | 'PERSONAL_INVESTIGATOR';

export type AccountType = 'PERSONAL' | 'ORGANIZATION';

export type CaseRole = 'OWNER' | 'MANAGER' | 'ANALYST' | 'REVIEWER' | 'VIEWER';

export interface CaseAccessAssignment {
  userId: string;
  userName: string;
  userEmail: string;
  role: CaseRole;
  assignedAt: string;
}

export type Permission =
  | 'investigation:create'
  | 'investigation:view'
  | 'investigation:view_all'
  | 'investigation:view_team'
  | 'investigation:view_assigned'
  | 'investigation:view_permitted'
  | 'investigation:edit'
  | 'investigation:delete'
  | 'investigation:assign'
  | 'investigation:reassign'
  | 'wallet:view'
  | 'wallet:analyze'
  | 'transaction:view'
  | 'transaction:export'
  | 'graph:view'
  | 'graph:trace'
  | 'graph:view_permitted'
  | 'fraud:view'
  | 'fraud:edit'
  | 'attribution:view'
  | 'attribution:edit'
  | 'crosschain:view'
  | 'ai:view'
  | 'report:create'
  | 'report:create_draft'
  | 'report:view'
  | 'report:view_all'
  | 'report:view_assigned'
  | 'report:view_approved'
  | 'report:edit'
  | 'report:approve'
  | 'report:request_change'
  | 'report:export'
  | 'report:history'
  | 'dataset:upload'
  | 'dataset:view'
  | 'dataset:delete'
  | 'watchlist:create'
  | 'watchlist:view'
  | 'watchlist:edit'
  | 'alerts:view'
  | 'alerts:manage'
  | 'employee:view'
  | 'employee:invite'
  | 'employee:disable'
  | 'employee:enable'
  | 'employee:remove'
  | 'employee:role_change'
  | 'organization:view'
  | 'organization:settings'
  | 'organization:security'
  | 'organization:integrations'
  | 'audit:view'
  | 'ownership:transfer';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  accountType: AccountType;
  role: UserRole;
  orgId?: string;
  orgName?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  ownerId?: string;
  createdAt: string;
  plan: 'ENTERPRISE' | 'INSTITUTIONAL';
  settings: {
    defaultNetwork: string;
    riskThreshold: number;
    autoAlerts: boolean;
    requireCaseMFA: boolean;
  };
}

export interface InvestigationCase {
  id: string;
  caseNumber: string;
  title: string;
  primaryWallet: string;
  network: string;
  riskScore: number;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
  status: 'NEW' | 'UNDER_INVESTIGATION' | 'MONITORING' | 'RESOLVED' | 'ARCHIVED';
  assignedAnalystId: string;
  assignedAnalystName: string;
  assignedManagerId?: string;
  assignedManagerName?: string;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  assignedViewerIds?: string[];
  accessAssignments?: CaseAccessAssignment[];
  isRestricted?: boolean;
  creatorId: string;
  orgId?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  fundTracedAmount?: number;
  fundTracedCurrency?: string;
}

export interface Transaction {
  id: string;
  txHash: string;
  network: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  asset: string;
  fee: number;
  timestamp: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  isSuspicious: boolean;
  riskScore: number;
  flags?: string[];
}

export interface WalletProfile {
  address: string;
  canonicalAddress?: string;
  label?: string;
  network: string;
  riskScore: number;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
  balance: number;
  totalReceived: number;
  totalSent: number;
  netFlow: number;
  currency: string;
  transactionCount: number;
  incomingCount: number;
  outgoingCount: number;
  uniqueSenders: number;
  uniqueReceivers: number;
  counterpartyCount: number;
  firstSeen: string;
  lastSeen: string;
  forwardingRatio: number;
  averageTimeToForwardMinutes: number;
  burstCount: number;
  rapidMovementCount: number;
  dormantToActiveScore: number;
  behaviorProfile: string[];
  clusterId?: string;
  clusterSize?: number;
  potentialEntity?: string | null;
  entityConfidence?: string | null;
}

export interface RiskFactor {
  factor: string;
  weight: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidence: string;
}

export interface RiskBreakdown {
  score: number;
  category: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
  factors: RiskFactor[];
  summary: string;
}

export interface FraudFinding {
  id: string;
  patternName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: 'Confirmed' | 'High' | 'Medium' | 'Low';
  description: string;
  evidence: string;
  affectedTransactions: string[];
  affectedWallets: string[];
  detectedAt: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'wallet' | 'exchange' | 'vasp' | 'bridge' | 'mixer' | 'protocol' | 'cluster';
  network: string;
  risk: number;
  riskCategory: string;
  entity?: string | null;
  cluster?: string;
  activityScore: number;
  balance?: number;
  isSubject?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  asset: string;
  timestamp: string;
  risk: number;
  type: 'transfer' | 'bridge' | 'interaction' | 'mixer_deposit';
  isSuspicious?: boolean;
  txHash: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    maxHops: number;
    suspiciousEdgeCount: number;
    centralNode: string;
    criticalPathCount: number;
  };
}

export interface EntityRecord {
  id: string;
  name: string;
  type: 'exchange' | 'vasp' | 'bridge' | 'mixer' | 'protocol' | 'merchant' | 'unknown';
  category: string;
  jurisdiction: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  verified: boolean;
  confidence: 'Confirmed' | 'High Confidence' | 'Medium Confidence' | 'Low Confidence' | 'Unknown';
  addresses: string[];
  volumeObserved: string;
  firstObserved: string;
  lastObserved: string;
  notes: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  orgId?: string;
  walletAddress: string;
  network: string;
  label: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  currentRiskScore: number;
  previousRiskScore: number;
  lastActivity: string;
  alertCount: number;
  status: 'ACTIVE' | 'PAUSED';
  createdAt: string;
}

export interface AlertItem {
  id: string;
  userId?: string;
  orgId?: string;
  walletAddress: string;
  network: string;
  type: 'RISK_INCREASE' | 'RAPID_MOVEMENT' | 'NEW_COUNTERPARTY' | 'SUSPICIOUS_TRANSACTION' | 'ENTITY_INTERACTION' | 'CROSS_CHAIN_HOP' | 'BURST_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  timestamp: string;
  status: 'UNREAD' | 'READ' | 'DISMISSED';
  metadata?: Record<string, any>;
}

export interface ReportDossier {
  id: string;
  reportNumber: string;
  caseId?: string;
  caseName?: string;
  subjectWallet: string;
  network: string;
  riskScore: number;
  riskCategory: string;
  executiveSummary: string;
  keyFindings: string[];
  behavioralAssessment: string;
  fundFlowSummary: string;
  entityExposure: string;
  timelineSummary: string;
  riskExplanation: string;
  conclusion: string;
  recommendedSteps: string[];
  walletMetrics: WalletProfile;
  fraudFindings: FraudFinding[];
  counterpartyCount: number;
  totalFundsTraced: string;
  createdBy: string;
  authorName: string;
  authorRole: string;
  orgId?: string;
  createdAt: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'FINALIZED' | 'VERIFIED';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewerName?: string;
  reviewedAt?: string;
  approvalHistory?: Array<{
    action: 'SUBMITTED' | 'APPROVED' | 'CHANGES_REQUESTED';
    by: string;
    name: string;
    role: string;
    notes?: string;
    timestamp: string;
  }>;
}

export interface DatasetItem {
  id: string;
  fileName: string;
  sizeBytes: number;
  rowCount: number;
  columnCount: number;
  detectedNetwork: string;
  validationStatus: 'VALID' | 'WARNINGS' | 'INVALID';
  duplicateCount: number;
  invalidRecordsCount: number;
  uploadedBy: string;
  uploaderName: string;
  orgId?: string;
  uploadedAt: string;
  samplePreview: any[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  orgId?: string;
  action: string;
  resource: string;
  resourceId: string;
  target?: string;
  integrityHash?: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details?: Record<string, any>;
}

export interface DiagnosticsStatus {
  service: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  responseTimeMs: number;
  version: string;
  lastChecked: string;
  details: string;
}
