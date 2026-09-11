import { Request, Response, NextFunction } from 'express';
import { User, UserRole, Permission, InvestigationCase, CaseRole, ReportDossier } from './types';
import { AuditLogger } from './auditLogger';
import { AuthenticatedRequest } from './auth';

// Normalize any legacy or case-variant role to the 7 canonical roles
export function normalizeRole(role?: string): UserRole {
  if (!role) return 'ORGANIZATION_ANALYST';
  const clean = role.trim().toUpperCase().replace(/[\s-]+/g, '_');
  
  if (clean === 'PERSONAL_USER' || clean === 'PERSONAL_INVESTIGATOR' || clean === 'PERSONAL') {
    return 'PERSONAL_USER';
  }
  if (clean === 'ORGANIZATION_OWNER' || clean === 'OWNER') {
    return 'ORGANIZATION_OWNER';
  }
  if (clean === 'ORGANIZATION_ADMIN' || clean === 'ADMIN') {
    return 'ORGANIZATION_ADMIN';
  }
  if (clean === 'ORGANIZATION_MANAGER' || clean === 'SENIOR_ANALYST' || clean === 'MANAGER') {
    return 'ORGANIZATION_MANAGER';
  }
  if (clean === 'ORGANIZATION_ANALYST' || clean === 'ANALYST') {
    return 'ORGANIZATION_ANALYST';
  }
  if (clean === 'ORGANIZATION_REVIEWER' || clean === 'REVIEWER') {
    return 'ORGANIZATION_REVIEWER';
  }
  if (clean === 'ORGANIZATION_VIEWER' || clean === 'VIEWER') {
    return 'ORGANIZATION_VIEWER';
  }
  return 'ORGANIZATION_ANALYST';
}

// Complete Granular Permission Map for the 7 Roles (Section 6.1 - 6.7 & 6.9)
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // 6.1 PERSONAL_USER: Isolated personal investigations, wallet & analysis. No org access.
  PERSONAL_USER: [
    'investigation:create',
    'investigation:view',
    'investigation:edit',
    'investigation:delete',
    'wallet:view',
    'wallet:analyze',
    'transaction:view',
    'transaction:export',
    'graph:view',
    'graph:trace',
    'fraud:view',
    'attribution:view',
    'crosschain:view',
    'ai:view',
    'report:create',
    'report:view',
    'report:edit',
    'report:export',
    'dataset:upload',
    'dataset:view',
    'dataset:delete',
    'watchlist:create',
    'watchlist:view',
    'watchlist:edit',
    'alerts:view',
    'alerts:manage'
  ],

  // 6.2 ORGANIZATION_OWNER: Complete organization authority, ownership transfer, security & policies.
  ORGANIZATION_OWNER: [
    'investigation:create',
    'investigation:view',
    'investigation:view_all',
    'investigation:view_team',
    'investigation:view_assigned',
    'investigation:view_permitted',
    'investigation:edit',
    'investigation:delete',
    'investigation:assign',
    'investigation:reassign',
    'wallet:view',
    'wallet:analyze',
    'transaction:view',
    'transaction:export',
    'graph:view',
    'graph:trace',
    'graph:view_permitted',
    'fraud:view',
    'fraud:edit',
    'attribution:view',
    'attribution:edit',
    'crosschain:view',
    'ai:view',
    'report:create',
    'report:create_draft',
    'report:view',
    'report:view_all',
    'report:view_assigned',
    'report:view_approved',
    'report:edit',
    'report:approve',
    'report:request_change',
    'report:export',
    'report:history',
    'dataset:upload',
    'dataset:view',
    'dataset:delete',
    'watchlist:create',
    'watchlist:view',
    'watchlist:edit',
    'alerts:view',
    'alerts:manage',
    'employee:view',
    'employee:invite',
    'employee:disable',
    'employee:enable',
    'employee:remove',
    'employee:role_change',
    'organization:view',
    'organization:settings',
    'organization:security',
    'organization:integrations',
    'audit:view',
    'ownership:transfer'
  ],

  // 6.3 ORGANIZATION_ADMIN: Full administrative capabilities EXCEPT ownership transfer and owner alteration.
  ORGANIZATION_ADMIN: [
    'investigation:create',
    'investigation:view',
    'investigation:view_all',
    'investigation:view_team',
    'investigation:view_assigned',
    'investigation:view_permitted',
    'investigation:edit',
    'investigation:assign',
    'investigation:reassign',
    'wallet:view',
    'wallet:analyze',
    'transaction:view',
    'transaction:export',
    'graph:view',
    'graph:trace',
    'graph:view_permitted',
    'fraud:view',
    'fraud:edit',
    'attribution:view',
    'attribution:edit',
    'crosschain:view',
    'ai:view',
    'report:create',
    'report:create_draft',
    'report:view',
    'report:view_all',
    'report:view_assigned',
    'report:view_approved',
    'report:edit',
    'report:approve',
    'report:request_change',
    'report:export',
    'report:history',
    'dataset:upload',
    'dataset:view',
    'dataset:delete',
    'watchlist:create',
    'watchlist:view',
    'watchlist:edit',
    'alerts:view',
    'alerts:manage',
    'employee:view',
    'employee:invite',
    'employee:disable',
    'employee:enable',
    'employee:remove',
    'employee:role_change',
    'organization:view',
    'organization:settings',
    'organization:security',
    'organization:integrations',
    'audit:view'
  ],

  // 6.4 ORGANIZATION_MANAGER: Team investigations, case assignment, reviewing work, approvals.
  ORGANIZATION_MANAGER: [
    'investigation:view',
    'investigation:view_team',
    'investigation:create',
    'investigation:assign',
    'investigation:reassign',
    'investigation:edit',
    'wallet:view',
    'wallet:analyze',
    'transaction:view',
    'graph:view',
    'graph:trace',
    'fraud:view',
    'attribution:view',
    'crosschain:view',
    'ai:view',
    'report:view',
    'report:create',
    'report:create_draft',
    'report:approve',
    'report:request_change',
    'report:export',
    'report:history',
    'dataset:view',
    'dataset:upload',
    'watchlist:view',
    'watchlist:create',
    'alerts:view',
    'alerts:manage',
    'organization:view'
  ],

  // 6.5 ORGANIZATION_ANALYST: Active investigation execution, tracing, graph analytics, draft reports.
  ORGANIZATION_ANALYST: [
    'investigation:create',
    'investigation:view',
    'investigation:view_assigned',
    'investigation:edit',
    'wallet:view',
    'wallet:analyze',
    'transaction:view',
    'graph:view',
    'graph:trace',
    'fraud:view',
    'attribution:view',
    'crosschain:view',
    'ai:view',
    'dataset:upload',
    'dataset:view',
    'report:create_draft',
    'report:create',
    'report:view',
    'report:view_assigned',
    'watchlist:create',
    'watchlist:view',
    'watchlist:edit',
    'alerts:view'
  ],

  // 6.6 ORGANIZATION_REVIEWER: Independent review, approving reports, request changes, evidence auditing.
  ORGANIZATION_REVIEWER: [
    'report:view',
    'report:view_assigned',
    'report:approve',
    'report:request_change',
    'report:history',
    'investigation:view',
    'investigation:view_assigned',
    'wallet:view',
    'transaction:view',
    'graph:view',
    'fraud:view',
    'attribution:view',
    'alerts:view'
  ],

  // 6.7 ORGANIZATION_VIEWER: Read-only inspection of permitted items, approved reports, graphs.
  ORGANIZATION_VIEWER: [
    'investigation:view',
    'investigation:view_permitted',
    'report:view',
    'report:view_approved',
    'wallet:view',
    'transaction:view',
    'graph:view',
    'fraud:view',
    'attribution:view',
    'alerts:view'
  ],

  // Legacy mappings for backward compatibility
  ADMIN: [] as Permission[],
  SENIOR_ANALYST: [] as Permission[],
  ANALYST: [] as Permission[],
  PERSONAL_INVESTIGATOR: [] as Permission[]
};

// Fill backward compatibility aliases
ROLE_PERMISSIONS.ADMIN = ROLE_PERMISSIONS.ORGANIZATION_ADMIN;
ROLE_PERMISSIONS.SENIOR_ANALYST = ROLE_PERMISSIONS.ORGANIZATION_MANAGER;
ROLE_PERMISSIONS.ANALYST = ROLE_PERMISSIONS.ORGANIZATION_ANALYST;
ROLE_PERMISSIONS.PERSONAL_INVESTIGATOR = ROLE_PERMISSIONS.PERSONAL_USER;

/**
 * Check whether a user has a specific granular permission.
 */
export function hasPermission(user: User | undefined, permission: Permission): boolean {
  if (!user || !user.isActive) return false;
  const canonicalRole = normalizeRole(user.role);
  const permissions = ROLE_PERMISSIONS[canonicalRole] || [];
  return permissions.includes(permission);
}

/**
 * Check whether a user can access a specific investigation case
 * Implements Section 6.8: RBAC + CASE-LEVEL ACCESS CONTROL
 */
export function canAccessCase(user: User, caseItem: InvestigationCase): boolean {
  if (!user || !user.isActive) return false;

  // 1. Personal users can ONLY access their own investigations
  if (user.accountType === 'PERSONAL' || normalizeRole(user.role) === 'PERSONAL_USER') {
    return caseItem.creatorId === user.id && (!caseItem.orgId || caseItem.orgId === user.orgId);
  }

  // 2. Cross-organization isolation: user cannot view cases belonging to another organization
  if (caseItem.orgId && user.orgId && caseItem.orgId !== user.orgId) {
    return false;
  }

  const role = normalizeRole(user.role);

  // 3. Organization Owner has complete visibility into all organization cases
  if (role === 'ORGANIZATION_OWNER') {
    return true;
  }

  // 4. Organization Admin has visibility into all organization cases unless strictly classified
  if (role === 'ORGANIZATION_ADMIN') {
    return true;
  }

  // 5. Explicit Case-Level Access Assignments (Section 6.8)
  // Check accessAssignments array
  if (caseItem.accessAssignments && caseItem.accessAssignments.length > 0) {
    const directAssignment = caseItem.accessAssignments.some(
      a => a.userId === user.id || a.userEmail.toLowerCase() === user.email.toLowerCase()
    );
    if (directAssignment) return true;
  }

  // Check direct assignment fields
  if (caseItem.creatorId === user.id) return true;
  if (caseItem.assignedAnalystId === user.id) return true;
  if (caseItem.assignedManagerId === user.id) return true;
  if (caseItem.assignedReviewerId === user.id) return true;
  if (caseItem.assignedViewerIds && caseItem.assignedViewerIds.includes(user.id)) return true;

  // 6. Organization Manager can view team cases if unassigned/not restricted
  if (role === 'ORGANIZATION_MANAGER' && !caseItem.isRestricted) {
    return true;
  }

  // If case is not explicitly assigned to this Analyst, Reviewer, or Viewer, access is denied
  return false;
}

/**
 * Check whether a user can edit an investigation case
 */
export function canEditCase(user: User, caseItem: InvestigationCase): boolean {
  if (!canAccessCase(user, caseItem)) return false;
  const role = normalizeRole(user.role);

  // Viewers and Reviewers cannot edit cases or alter evidence
  if (role === 'ORGANIZATION_VIEWER' || role === 'ORGANIZATION_REVIEWER') {
    return false;
  }

  if (role === 'ORGANIZATION_OWNER' || role === 'ORGANIZATION_ADMIN') {
    return true;
  }

  if (role === 'PERSONAL_USER') {
    return caseItem.creatorId === user.id;
  }

  // Manager or assigned Analyst
  if (role === 'ORGANIZATION_MANAGER') return true;
  if (role === 'ORGANIZATION_ANALYST') {
    return caseItem.assignedAnalystId === user.id || caseItem.creatorId === user.id;
  }

  return false;
}

/**
 * Express Middleware: Require specific granular permission
 */
export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      AuditLogger.logAuthEvent('PERMISSION_DENIED', 'anonymous', 'FAILURE', {
        path: req.path,
        method: req.method,
        requiredPermission: permission,
        reason: 'Unauthenticated'
      });
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    if (!hasPermission(user, permission)) {
      AuditLogger.logAuthEvent('PERMISSION_DENIED', user.email, 'FAILURE', {
        path: req.path,
        method: req.method,
        userRole: user.role,
        requiredPermission: permission
      }, user);

      return res.status(403).json({
        error: `Access denied — insufficient permissions for action: ${permission}.`,
        code: 'PERMISSION_DENIED',
        requiredPermission: permission,
        userRole: user.role
      });
    }

    next();
  };
}

/**
 * Express Middleware: Require at least one of the listed permissions
 */
export function requireAnyPermission(permissions: Permission[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    const hasAny = permissions.some(p => hasPermission(user, p));
    if (!hasAny) {
      AuditLogger.logAuthEvent('PERMISSION_DENIED', user.email, 'FAILURE', {
        path: req.path,
        userRole: user.role,
        requiredPermissions: permissions
      }, user);

      return res.status(403).json({
        error: `Access denied — insufficient authorization.`,
        code: 'PERMISSION_DENIED',
        userRole: user.role
      });
    }

    next();
  };
}

/**
 * Express Middleware: Require specific role list
 */
export function requireRoles(allowedRoles: UserRole[]) {
  const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    const userRole = normalizeRole(user.role);
    if (!normalizedAllowed.includes(userRole)) {
      AuditLogger.logAuthEvent('PERMISSION_DENIED', user.email, 'FAILURE', {
        path: req.path,
        userRole: user.role,
        allowedRoles
      }, user);

      return res.status(403).json({
        error: `Access denied — role '${userRole}' is not permitted for this resource.`,
        code: 'ROLE_UNAUTHORIZED'
      });
    }

    next();
  };
}
