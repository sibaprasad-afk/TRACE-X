import {
  User,
  InvestigationCase,
  Transaction,
  WalletProfile,
  RiskBreakdown,
  FraudFinding,
  GraphData,
  EntityRecord,
  WatchlistItem,
  AlertItem,
  ReportDossier,
  DatasetItem,
  AuditLogEntry,
  DiagnosticsStatus,
  InvestigationResult
} from '../types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('tracex_auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An unexpected API error occurred.';
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {
      errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string, role?: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    const data = await handleResponse<{ user: User; token?: string; access_token?: string }>(res);
    const token = data.access_token || data.token || '';
    if (token) {
      localStorage.setItem('tracex_auth_token', token);
    }
    return { user: data.user, token };
  },

  async register(payload: {
    email: string;
    name: string;
    password: string;
    confirmPassword?: string;
    accountType?: string;
    orgName?: string;
    department?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await handleResponse<{ user: User; token?: string; access_token?: string }>(res);
    const token = data.access_token || data.token || '';
    if (token) {
      localStorage.setItem('tracex_auth_token', token);
    }
    return { user: data.user, token };
  },

  async forgotPassword(email: string): Promise<{ message: string; devNote?: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse<{ message: string; devNote?: string }>(res);
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders()
      });
    } finally {
      localStorage.removeItem('tracex_auth_token');
    }
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    return handleResponse<{ user: User }>(res);
  },

  // Dashboard KPIs
  async getKPIs(): Promise<{
    activeInvestigations: number;
    criticalHighRiskWallets: number;
    suspiciousTxs: number;
    fundsTraced: string;
    monitoredWallets: number;
  }> {
    const res = await fetch(`${API_BASE}/kpis`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Wallet Investigation (Core)
  async analyzeWallet(address: string, network = 'Ethereum'): Promise<InvestigationResult> {
    const res = await fetch(`${API_BASE}/wallet/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ address, network })
    });
    return handleResponse<InvestigationResult>(res);
  },

  async getWallet(address: string): Promise<WalletProfile> {
    const res = await fetch(`${API_BASE}/wallet/${encodeURIComponent(address)}`, { headers: getHeaders() });
    return handleResponse<WalletProfile>(res);
  },

  async getWalletTransactions(address: string): Promise<Transaction[]> {
    const res = await fetch(`${API_BASE}/wallet/${encodeURIComponent(address)}/transactions`, { headers: getHeaders() });
    return handleResponse<Transaction[]>(res);
  },

  async getWalletRisk(address: string): Promise<RiskBreakdown> {
    const res = await fetch(`${API_BASE}/wallet/${encodeURIComponent(address)}/risk`, { headers: getHeaders() });
    return handleResponse<RiskBreakdown>(res);
  },

  async getWalletFraud(address: string): Promise<FraudFinding[]> {
    const res = await fetch(`${API_BASE}/wallet/${encodeURIComponent(address)}/fraud`, { headers: getHeaders() });
    return handleResponse<FraudFinding[]>(res);
  },

  async getWalletGraph(address: string, hops = 3, filter = 'ALL'): Promise<GraphData> {
    const res = await fetch(`${API_BASE}/wallet/${encodeURIComponent(address)}/graph?hops=${hops}&filter=${filter}`, { headers: getHeaders() });
    return handleResponse<GraphData>(res);
  },

  async traceMoneyFlow(address: string): Promise<any> {
    const res = await fetch(`${API_BASE}/graph/trace`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ address })
    });
    return handleResponse<any>(res);
  },

  // Transactions Explorer
  async getTransactions(params?: { network?: string; asset?: string; suspicious?: boolean; search?: string; limit?: number; offset?: number }): Promise<{
    total: number;
    offset: number;
    limit: number;
    transactions: Transaction[];
  }> {
    const q = new URLSearchParams();
    if (params?.network) q.append('network', params.network);
    if (params?.asset) q.append('asset', params.asset);
    if (params?.suspicious) q.append('suspicious', 'true');
    if (params?.search) q.append('search', params.search);
    if (params?.limit) q.append('limit', String(params.limit));
    if (params?.offset) q.append('offset', String(params.offset));

    const res = await fetch(`${API_BASE}/transactions?${q.toString()}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getTransaction(hash: string): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions/${encodeURIComponent(hash)}`, { headers: getHeaders() });
    return handleResponse<Transaction>(res);
  },

  // Investigations
  async getInvestigations(): Promise<InvestigationCase[]> {
    const res = await fetch(`${API_BASE}/investigations`, { headers: getHeaders() });
    return handleResponse<InvestigationCase[]>(res);
  },

  async getInvestigation(id: string): Promise<InvestigationCase> {
    const res = await fetch(`${API_BASE}/investigations/${encodeURIComponent(id)}`, { headers: getHeaders() });
    return handleResponse<InvestigationCase>(res);
  },

  async createInvestigation(payload: Partial<InvestigationCase>): Promise<InvestigationCase> {
    const res = await fetch(`${API_BASE}/investigations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<InvestigationCase>(res);
  },

  async createCase(payload: Partial<InvestigationCase>): Promise<InvestigationCase> {
    return this.createInvestigation(payload);
  },

  async updateInvestigation(id: string, payload: Partial<InvestigationCase>): Promise<InvestigationCase> {
    const res = await fetch(`${API_BASE}/investigations/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<InvestigationCase>(res);
  },

  // Entities / VASP
  async getEntities(): Promise<EntityRecord[]> {
    const res = await fetch(`${API_BASE}/entities`, { headers: getHeaders() });
    return handleResponse<EntityRecord[]>(res);
  },

  async getEntity(id: string): Promise<EntityRecord> {
    const res = await fetch(`${API_BASE}/entities/${encodeURIComponent(id)}`, { headers: getHeaders() });
    return handleResponse<EntityRecord>(res);
  },

  // Clusters & Cross-Chain
  async getClusters(address?: string): Promise<any[]> {
    const url = address ? `${API_BASE}/clusters?address=${encodeURIComponent(address)}` : `${API_BASE}/clusters`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async getCrossChainTransfers(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/cross-chain`, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  // Watchlist
  async getWatchlist(): Promise<WatchlistItem[]> {
    const res = await fetch(`${API_BASE}/watchlist`, { headers: getHeaders() });
    return handleResponse<WatchlistItem[]>(res);
  },

  async addToWatchlist(payload: { walletAddress: string; network?: string; label?: string; priority?: string }): Promise<WatchlistItem> {
    const res = await fetch(`${API_BASE}/watchlist`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<WatchlistItem>(res);
  },

  async removeFromWatchlist(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/watchlist/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  },

  // Alerts
  async getAlerts(): Promise<AlertItem[]> {
    const res = await fetch(`${API_BASE}/alerts`, { headers: getHeaders() });
    return handleResponse<AlertItem[]>(res);
  },

  async updateAlert(id: string, payload: Partial<AlertItem>): Promise<AlertItem> {
    const res = await fetch(`${API_BASE}/alerts/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<AlertItem>(res);
  },

  async acknowledgeAlert(id: string): Promise<AlertItem> {
    return this.updateAlert(id, { status: 'READ' });
  },

  // Reports
  async getReports(): Promise<ReportDossier[]> {
    const res = await fetch(`${API_BASE}/reports`, { headers: getHeaders() });
    return handleResponse<ReportDossier[]>(res);
  },

  async getReport(id: string): Promise<ReportDossier> {
    const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(id)}`, { headers: getHeaders() });
    return handleResponse<ReportDossier>(res);
  },

  async createReport(payload: { subjectWallet: string; network?: string; caseId?: string; caseName?: string }): Promise<ReportDossier> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<ReportDossier>(res);
  },

  async deleteReport(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  },

  // Datasets
  async getDatasets(): Promise<DatasetItem[]> {
    const res = await fetch(`${API_BASE}/datasets`, { headers: getHeaders() });
    return handleResponse<DatasetItem[]>(res);
  },

  async uploadDataset(fileName: string, csvContent: string): Promise<{ dataset: DatasetItem; importedCount: number }> {
    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fileName, csvContent })
    });
    return handleResponse(res);
  },

  async ingestDataset(payload: { datasetName: string; recordCount?: number }): Promise<any> {
    return this.uploadDataset(payload.datasetName, 'sample,csv,data');
  },

  async deleteDataset(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/datasets/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  },

  // Admin & Employees
  async getEmployees(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/employees`, { headers: getHeaders() });
    return handleResponse<User[]>(res);
  },

  async createEmployee(payload: { name: string; email: string; role: string; department?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/employees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<User>(res);
  },

  async updateEmployee(id: string, payload: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/employees/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<User>(res);
  },

  async deleteEmployee(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/employees/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(res);
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, { headers: getHeaders() });
    return handleResponse<AuditLogEntry[]>(res);
  },

  // Diagnostics
  async getDiagnostics(): Promise<DiagnosticsStatus[]> {
    const res = await fetch(`${API_BASE}/diagnostics`, { headers: getHeaders() });
    return handleResponse<DiagnosticsStatus[]>(res);
  }
};
