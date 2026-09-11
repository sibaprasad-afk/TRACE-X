import { Transaction, WalletProfile } from './types';
import { db } from './database';

export interface BlockchainProvider {
  networkName: string;
  isAvailable(): Promise<boolean>;
  getWalletBalance(address: string): Promise<{ balance: number; currency: string }>;
  getTransactions(address: string, limit?: number): Promise<Transaction[]>;
  getTransactionDetails(txHash: string): Promise<Transaction | null>;
  search(query: string): Promise<any>;
}

export class DemoBlockchainProvider implements BlockchainProvider {
  networkName = 'Multi-Network Demo Provider (Ethereum, Polygon, Bitcoin, BNB Chain, Solana)';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getWalletBalance(address: string): Promise<{ balance: number; currency: string }> {
    const profile = db.getWalletProfile(address);
    if (profile) {
      return { balance: profile.balance, currency: profile.currency || 'ETH' };
    }
    // Calculate from transactions
    const txs = db.getTransactionsForAddress(address);
    let bal = 0;
    const lower = address.toLowerCase();
    txs.forEach(t => {
      if (t.toAddress.toLowerCase() === lower) bal += t.amount;
      if (t.fromAddress.toLowerCase() === lower) bal -= t.amount;
    });
    return { balance: Math.max(0, parseFloat(bal.toFixed(4))), currency: 'ETH' };
  }

  async getTransactions(address: string, limit = 100): Promise<Transaction[]> {
    const all = db.getTransactionsForAddress(address);
    return all.slice(0, limit);
  }

  async getTransactionDetails(txHash: string): Promise<Transaction | null> {
    return db.getTransactionByHash(txHash) || null;
  }

  async search(query: string): Promise<any> {
    const q = query.trim().toLowerCase();
    const wallets = db.getAllWallets().filter(w => 
      w.address.toLowerCase().includes(q) || 
      (w.label && w.label.toLowerCase().includes(q)) ||
      (w.canonicalAddress && w.canonicalAddress.toLowerCase().includes(q))
    );
    const tx = db.getTransactionByHash(q);
    const entities = db.getAllEntities().filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.id.toLowerCase().includes(q) ||
      e.addresses.some(a => a.toLowerCase().includes(q))
    );

    return { wallets, transaction: tx || null, entities };
  }
}

// Extensible provider registry
export class ProviderFactory {
  private static providers: Map<string, BlockchainProvider> = new Map();

  static getProvider(network = 'Ethereum'): BlockchainProvider {
    // Default offline deterministic demo provider for all networks
    if (!this.providers.has('DEMO')) {
      this.providers.set('DEMO', new DemoBlockchainProvider());
    }
    return this.providers.get('DEMO')!;
  }
}
