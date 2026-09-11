import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './database';
import { User, UserRole } from './types';
import { AuditLogger } from './auditLogger';
import { normalizeRole } from './permissions';

// In-memory token session mapping
const sessions = new Map<string, { userId: string; expiresAt: number }>();

export function generateToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  // 7 days expiration
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  sessions.set(token, { userId, expiresAt });
  return token;
}

export function revokeToken(token: string): void {
  sessions.delete(token);
}

export function getUserFromToken(token?: string): User | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return db.getUserById(session.userId) || null;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'] as string;
  }

  if (token) {
    const user = getUserFromToken(token);
    if (user && user.isActive) {
      req.user = user;
    }
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    AuditLogger.logAuthEvent('ACCESS_DENIED', 'anonymous', 'FAILURE', {
      path: req.path,
      method: req.method,
      reason: 'Authentication required'
    });
    return res.status(401).json({ error: 'Unauthorized: Authentication required. Please sign in.' });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      AuditLogger.logAuthEvent('ACCESS_DENIED', 'anonymous', 'FAILURE', {
        path: req.path,
        reason: 'Authentication required'
      });
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }
    const userRole = normalizeRole(req.user.role);
    if (!normalizedAllowed.includes(userRole)) {
      AuditLogger.logAuthEvent('ACCESS_DENIED', req.user.email, 'FAILURE', {
        path: req.path,
        userRole: req.user.role,
        requiredRoles: allowedRoles
      }, req.user);
      return res.status(403).json({
        error: `Access denied — insufficient role privileges for action.`
      });
    }
    next();
  };
}

export function requireOrgAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    AuditLogger.logAuthEvent('ACCESS_DENIED', 'anonymous', 'FAILURE', {
      path: req.path,
      reason: 'Authentication required'
    });
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }
  const role = normalizeRole(req.user.role);
  if (role !== 'ORGANIZATION_OWNER' && role !== 'ORGANIZATION_ADMIN') {
    AuditLogger.logAuthEvent('ACCESS_DENIED', req.user.email, 'FAILURE', {
      path: req.path,
      userRole: req.user.role,
      reason: 'Administrator privileges required'
    }, req.user);
    return res.status(403).json({
      error: 'Access denied — administrator or owner privileges required.'
    });
  }
  next();
}

export function requireOrgOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    AuditLogger.logAuthEvent('ACCESS_DENIED', 'anonymous', 'FAILURE', {
      path: req.path,
      reason: 'Authentication required'
    });
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }
  const role = normalizeRole(req.user.role);
  if (role !== 'ORGANIZATION_OWNER') {
    AuditLogger.logAuthEvent('ACCESS_DENIED', req.user.email, 'FAILURE', {
      path: req.path,
      userRole: req.user.role,
      reason: 'Apex Organization Owner clearance required'
    }, req.user);
    return res.status(403).json({
      error: 'Access denied — Apex Organization Owner clearance required.'
    });
  }
  next();
}

