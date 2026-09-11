import { db } from './database';
import { EntityRecord } from './types';

export class AttributionEngine {
  static getEntityRegistry(): EntityRecord[] {
    return db.getAllEntities();
  }

  static getEntityById(id: string): EntityRecord | undefined {
    return db.getEntityById(id);
  }

  static matchAddress(address: string): {
    entity: EntityRecord | null;
    isAttributed: boolean;
    attributionConfidence: 'Confirmed' | 'High Confidence' | 'Medium Confidence' | 'Low Confidence' | 'Unknown';
    note: string;
  } {
    const matched = db.findEntityForAddress(address);
    if (matched) {
      return {
        entity: matched,
        isAttributed: true,
        attributionConfidence: matched.confidence,
        note: `Direct counterparty address matched registered entity cluster: ${matched.name} (${matched.category})`
      };
    }

    // Heuristic inference for exchange-like addresses
    const txs = db.getTransactionsForAddress(address);
    if (txs.length > 50) {
      return {
        entity: null,
        isAttributed: false,
        attributionConfidence: 'Medium Confidence',
        note: 'Potential VASP Hot Wallet (High transaction volume and multi-counterparty dispersion patterns observed).'
      };
    }

    return {
      entity: null,
      isAttributed: false,
      attributionConfidence: 'Unknown',
      note: 'No entity record attributed. Address appears unassociated in current registry.'
    };
  }
}
