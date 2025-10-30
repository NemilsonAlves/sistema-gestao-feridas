import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  name: string
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch {
      return null
    }
  }

  static generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
  }
}

// RBAC - Role-Based Access Control
export const PERMISSIONS = {
  // Gestão de Pacientes
  PATIENT_CREATE: 'patient:create',
  PATIENT_READ: 'patient:read',
  PATIENT_UPDATE: 'patient:update',
  PATIENT_DELETE: 'patient:delete',

  // Gestão de Feridas
  WOUND_CREATE: 'wound:create',
  WOUND_READ: 'wound:read',
  WOUND_UPDATE: 'wound:update',
  WOUND_DELETE: 'wound:delete',

  // Tratamentos
  TREATMENT_CREATE: 'treatment:create',
  TREATMENT_READ: 'treatment:read',
  TREATMENT_UPDATE: 'treatment:update',
  TREATMENT_DELETE: 'treatment:delete',

  // Relatórios
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',

  // Administração
  USER_MANAGE: 'user:manage',
  SYSTEM_CONFIG: 'system:config',

  // Telemedicina
  TELEMEDICINE_ACCESS: 'telemedicine:access',
  TELEMEDICINE_MODERATE: 'telemedicine:moderate',
} as const

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: Object.values(PERMISSIONS),
  
  [UserRole.DOCTOR]: [
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.WOUND_CREATE,
    PERMISSIONS.WOUND_READ,
    PERMISSIONS.WOUND_UPDATE,
    PERMISSIONS.TREATMENT_CREATE,
    PERMISSIONS.TREATMENT_READ,
    PERMISSIONS.TREATMENT_UPDATE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.TELEMEDICINE_ACCESS,
    PERMISSIONS.TELEMEDICINE_MODERATE,
  ],
  
  [UserRole.NURSE]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.WOUND_CREATE,
    PERMISSIONS.WOUND_READ,
    PERMISSIONS.WOUND_UPDATE,
    PERMISSIONS.TREATMENT_CREATE,
    PERMISSIONS.TREATMENT_READ,
    PERMISSIONS.TREATMENT_UPDATE,
    PERMISSIONS.TELEMEDICINE_ACCESS,
  ],
  
  [UserRole.PHYSIOTHERAPIST]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.WOUND_READ,
    PERMISSIONS.TREATMENT_READ,
    PERMISSIONS.TREATMENT_UPDATE,
    PERMISSIONS.TELEMEDICINE_ACCESS,
  ],
  
  [UserRole.NUTRITIONIST]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.WOUND_READ,
    PERMISSIONS.TREATMENT_READ,
    PERMISSIONS.TELEMEDICINE_ACCESS,
  ],
  
  [UserRole.PATIENT]: [
    PERMISSIONS.TELEMEDICINE_ACCESS,
  ],
}

export function hasPermission(userRole: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}

export function checkPermissions(userRole: UserRole, requiredPermissions: string[]): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole] || []
  return requiredPermissions.every(permission => userPermissions.includes(permission))
}