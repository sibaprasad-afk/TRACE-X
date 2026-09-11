import { User, UserRole, Permission, InvestigationCase, CaseRole } from '../types';

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

export interface RoleMetadata {
  role: UserRole;
  label: string;
  shortCode: string;
  clearanceLevel: string;
  tierNumber: number;
  description: string;
  badgeClass: string;
  borderClass: string;
}

export const ROLE_METADATA: Record<string, RoleMetadata> = {
  ORGANIZATION_OWNER: {
    role: 'ORGANIZATION_OWNER',
    label: 'Organization Owner',
    shortCode: 'OWNER',
    clearanceLevel: 'LEVEL 5 — APEX CLEARANCE',
    tierNumber: 5,
    description: 'Complete organizational control, security policy administration, and ownership transfer authority.',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderClass: 'border-amber-500/40'
  },
  ORGANIZATION_ADMIN: {
    role: 'ORGANIZATION_ADMIN',
    label: 'Organization Admin',
    shortCode: 'ADMIN',
    clearanceLevel: 'LEVEL 4 — SYSTEM DIRECTOR',
    tierNumber: 4,
    description: 'Team management, employee provisioning, case administration, and workspace governance.',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderClass: 'border-rose-500/40'
  },
  ORGANIZATION_MANAGER: {
    role: 'ORGANIZATION_MANAGER',
    label: 'Organization Manager',
    shortCode: 'MANAGER',
    clearanceLevel: 'LEVEL 3 — OPERATIONS LEAD',
    tierNumber: 3,
    description: 'Investigation assignments, team supervision, report approval review, and performance tracking.',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderClass: 'border-purple-500/40'
  },
  ORGANIZATION_ANALYST: {
    role: 'ORGANIZATION_ANALYST',
    label: 'Organization Analyst',
    shortCode: 'ANALYST',
    clearanceLevel: 'LEVEL 2 — FORENSIC ANALYST',
    tierNumber: 2,
    description: 'Active blockchain tracing, multi-hop analytics, fraud detection, and dossier drafting.',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderClass: 'border-emerald-500/40'
  },
  ORGANIZATION_REVIEWER: {
    role: 'ORGANIZATION_REVIEWER',
    label: 'Organization Reviewer',
    shortCode: 'REVIEWER',
    clearanceLevel: 'LEVEL 2 — INDEPENDENT AUDITOR',
    tierNumber: 2,
    description: 'Independent dossier auditing, chain-of-custody verification, review notes, and sign-offs.',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    borderClass: 'border-cyan-500/40'
  },
  ORGANIZATION_VIEWER: {
    role: 'ORGANIZATION_VIEWER',
    label: 'Organization Viewer',
    shortCode: 'VIEWER',
    clearanceLevel: 'LEVEL 1 — COMPLIANCE VIEWER',
    tierNumber: 1,
    description: 'Read-only examination of permitted investigation findings and finalized dossiers.',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    borderClass: 'border-slate-500/40'
  },
  PERSONAL_USER: {
    role: 'PERSONAL_USER',
    label: 'Personal User',
    shortCode: 'PERSONAL',
    clearanceLevel: 'SANDBOX — INDEPENDENT RESEARCH',
    tierNumber: 1,
    description: 'Self-directed cryptocurrency investigation environment with isolated personal datasets.',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderClass: 'border-blue-500/40'
  },
  // Backward-compatibility aliases
  ADMIN: {
    role: 'ORGANIZATION_ADMIN',
    label: 'Organization Admin',
    shortCode: 'ADMIN',
    clearanceLevel: 'LEVEL 4 — SYSTEM DIRECTOR',
    tierNumber: 4,
    description: 'Team management, employee provisioning, case administration, and workspace governance.',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderClass: 'border-rose-500/40'
  },
  SENIOR_ANALYST: {
    role: 'ORGANIZATION_MANAGER',
    label: 'Organization Manager',
    shortCode: 'MANAGER',
    clearanceLevel: 'LEVEL 3 — OPERATIONS LEAD',
    tierNumber: 3,
    description: 'Investigation assignments, team supervision, report approval review, and performance tracking.',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderClass: 'border-purple-500/40'
  },
  ANALYST: {
    role: 'ORGANIZATION_ANALYST',
    label: 'Organization Analyst',
    shortCode: 'ANALYST',
    clearanceLevel: 'LEVEL 2 — FORENSIC ANALYST',
    tierNumber: 2,
    description: 'Active blockchain tracing, multi-hop analytics, fraud detection, and dossier drafting.',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderClass: 'border-emerald-500/40'
  },
  PERSONAL_INVESTIGATOR: {
    role: 'PERSONAL_USER',
    label: 'Personal User',
    shortCode: 'PERSONAL',
    clearanceLevel: 'SANDBOX — INDEPENDENT RESEARCH',
    tierNumber: 1,
    description: 'Self-directed cryptocurrency investigation environment with isolated personal datasets.',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderClass: 'border-blue-500/40'
  }
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
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
  ADMIN: [] as Permission[],
  SENIOR_ANALYST: [] as Permission[],
  ANALYST: [] as Permission[],
  PERSONAL_INVESTIGATOR: [] as Permission[]
};

ROLE_PERMISSIONS.ADMIN = ROLE_PERMISSIONS.ORGANIZATION_ADMIN;
ROLE_PERMISSIONS.SENIOR_ANALYST = ROLE_PERMISSIONS.ORGANIZATION_MANAGER;
ROLE_PERMISSIONS.ANALYST = ROLE_PERMISSIONS.ORGANIZATION_ANALYST;
ROLE_PERMISSIONS.PERSONAL_INVESTIGATOR = ROLE_PERMISSIONS.PERSONAL_USER;

export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  if (!user || !user.isActive) return false;
  const canonicalRole = normalizeRole(user.role);
  const permissions = ROLE_PERMISSIONS[canonicalRole] || [];
  return permissions.includes(permission);
}

export function canAccessCase(user: User | null | undefined, caseItem: InvestigationCase): boolean {
  if (!user || !user.isActive) return false;

  // Personal user
  if (user.accountType === 'PERSONAL' || normalizeRole(user.role) === 'PERSONAL_USER') {
    return caseItem.creatorId === user.id && (!caseItem.orgId || caseItem.orgId === user.orgId);
  }

  // Cross-org boundary
  if (caseItem.orgId && user.orgId && caseItem.orgId !== user.orgId) {
    return false;
  }

  const role = normalizeRole(user.role);
  if (role === 'ORGANIZATION_OWNER' || role === 'ORGANIZATION_ADMIN') {
    return true;
  }

  // Direct case assignments (Section 6.8)
  if (caseItem.accessAssignments && caseItem.accessAssignments.length > 0) {
    const isAssigned = caseItem.accessAssignments.some(
      a => a.userId === user.id || a.userEmail.toLowerCase() === user.email.toLowerCase()
    );
    if (isAssigned) return true;
  }

  if (caseItem.creatorId === user.id) return true;
  if (caseItem.assignedAnalystId === user.id) return true;
  if (caseItem.assignedManagerId === user.id) return true;
  if (caseItem.assignedReviewerId === user.id) return true;
  if (caseItem.assignedViewerIds && caseItem.assignedViewerIds.includes(user.id)) return true;

  if (role === 'ORGANIZATION_MANAGER' && !caseItem.isRestricted) {
    return true;
  }

  return false;
}

export function canEditCase(user: User | null | undefined, caseItem: InvestigationCase): boolean {
  if (!user || !canAccessCase(user, caseItem)) return false;
  const role = normalizeRole(user.role);

  if (role === 'ORGANIZATION_VIEWER' || role === 'ORGANIZATION_REVIEWER') {
    return false;
  }
  if (role === 'ORGANIZATION_OWNER' || role === 'ORGANIZATION_ADMIN' || role === 'ORGANIZATION_MANAGER') {
    return true;
  }
  if (role === 'PERSONAL_USER') {
    return caseItem.creatorId === user.id;
  }
  if (role === 'ORGANIZATION_ANALYST') {
    return caseItem.assignedAnalystId === user.id || caseItem.creatorId === user.id;
  }
  return false;
}

export function getRoleMeta(role?: string): RoleMetadata {
  const norm = normalizeRole(role);
  return ROLE_METADATA[norm] || ROLE_METADATA.ORGANIZATION_ANALYST;
}
