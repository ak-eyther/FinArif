/**
 * Permission utilities for role-based access control
 * Provides helpers to check user permissions
 */

import type { UserRole } from '@/lib/types/auth';
import { ROLE_PERMISSIONS } from '@/lib/types/auth';

/**
 * Check if a user role has permission to perform an action on a resource
 */
export function hasPermission(
  role: UserRole,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  const resourcePermission = permissions.find((p) => p.resource === resource);

  if (!resourcePermission) {
    return false;
  }

  return resourcePermission.actions.includes(action);
}

/**
 * Check if a user role can read a resource
 */
export function canRead(role: UserRole, resource: string): boolean {
  return hasPermission(role, resource, 'read');
}

/**
 * Check if a user role can create a resource
 */
export function canCreate(role: UserRole, resource: string): boolean {
  return hasPermission(role, resource, 'create');
}

/**
 * Check if a user role can update a resource
 */
export function canUpdate(role: UserRole, resource: string): boolean {
  return hasPermission(role, resource, 'update');
}

/**
 * Check if a user role can delete a resource
 */
export function canDelete(role: UserRole, resource: string): boolean {
  return hasPermission(role, resource, 'delete');
}

/**
 * Check if a user role is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole) {
  return ROLE_PERMISSIONS[role];
}
