import crypto from 'crypto';
import { db } from './database';
import { User, AuditLogEntry } from './types';

export class AuditLogger {
  static log(
    user: Partial<User> | null,
    action: string,
    resource: string,
    resourceId: string,
    details?: Record<string, any>,
    status: 'SUCCESS' | 'FAILURE' | 'WARNING' = 'SUCCESS',
    ipAddress = '127.0.0.1'
  ): void {
    const userId = user?.id || 'sys_anon';
    const rawPayload = `${Date.now()}:${userId}:${action}:${resource}:${resourceId}:${ipAddress}`;
    const integrityHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const entry: AuditLogEntry = {
      id: `log_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date().toISOString(),
      userId,
      userName: user?.name || 'System / Anonymous',
      userEmail: user?.email || 'unauthenticated@tracex.internal',
      orgId: user?.orgId,
      action,
      resource,
      resourceId,
      target: `${resource}: ${resourceId}`,
      integrityHash,
      ipAddress,
      status,
      details
    };
    db.addAuditLog(entry);
  }

  static logAuthEvent(
    action: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'PASSWORD_RESET_REQUEST' | 'ACCOUNT_DISABLED' | 'ROLE_MISMATCH' | 'ACCESS_DENIED',
    email: string,
    status: 'SUCCESS' | 'FAILURE' | 'WARNING' = 'SUCCESS',
    details?: Record<string, any>,
    user?: User | null,
    ipAddress = '127.0.0.1'
  ): void {
    const userId = user?.id || `anon_${crypto.createHash('md5').update(email || 'anon').digest('hex').substring(0, 8)}`;
    const rawPayload = `${Date.now()}:${userId}:${action}:AUTH:${email}:${ipAddress}`;
    const integrityHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const entry: AuditLogEntry = {
      id: `log_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date().toISOString(),
      userId,
      userName: user?.name || email || 'Unauthenticated User',
      userEmail: user?.email || email || 'unknown',
      orgId: user?.orgId,
      action,
      resource: 'AUTH',
      resourceId: email || userId,
      target: `AUTH: ${action} (${email || 'unknown'})`,
      integrityHash,
      ipAddress,
      status,
      details
    };
    db.addAuditLog(entry);
  }
}
