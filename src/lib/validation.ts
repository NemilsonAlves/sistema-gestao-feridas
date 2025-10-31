/**
 * Validation utilities with security best practices
 */

// CPF validation
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false
  
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '')
  
  // Check if has 11 digits
  if (cleanCPF.length !== 11) return false
  
  // Check for known invalid patterns
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false
  
  // Validate check digits
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false
  
  return true
}

// Email validation with security considerations
export function validateEmail(email: string): boolean {
  if (!email || email.length > 254) return false
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email)
}

// Phone validation (Brazilian format)
export function validatePhone(phone: string): boolean {
  if (!phone) return false
  
  const cleanPhone = phone.replace(/\D/g, '')
  return cleanPhone.length === 10 || cleanPhone.length === 11
}

// Password strength validation
export function validatePassword(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  if (!password) {
    return { isValid: false, score: 0, feedback: ['Senha é obrigatória'] }
  }
  
  if (password.length < 8) {
    feedback.push('Senha deve ter pelo menos 8 caracteres')
  } else {
    score += 1
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push('Senha deve conter pelo menos uma letra minúscula')
  } else {
    score += 1
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Senha deve conter pelo menos uma letra maiúscula')
  } else {
    score += 1
  }
  
  if (!/\d/.test(password)) {
    feedback.push('Senha deve conter pelo menos um número')
  } else {
    score += 1
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Senha deve conter pelo menos um caractere especial')
  } else {
    score += 1
  }
  
  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Evite repetir o mesmo caractere consecutivamente')
    score -= 1
  }
  
  if (/123|abc|qwe/i.test(password)) {
    feedback.push('Evite sequências óbvias de caracteres')
    score -= 1
  }
  
  return {
    isValid: score >= 4 && feedback.length === 0,
    score: Math.max(0, score),
    feedback
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000) // Limit length
}

// HTML sanitization for rich text
export function sanitizeHTML(html: string): string {
  if (!html) return ''
  
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

// File validation
export function validateFile(file: File, options: {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options
  
  if (file.size > maxSize) {
    errors.push(`Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`)
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`)
  }
  
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`Extensão não permitida. Extensões aceitas: ${allowedExtensions.join(', ')}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// URL validation
export function validateURL(url: string): boolean {
  if (!url) return false
  
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// Date validation
export function validateDate(date: string | Date): boolean {
  if (!date) return false
  
  const dateObj = new Date(date)
  return dateObj instanceof Date && !isNaN(dateObj.getTime())
}

// Age validation
export function validateAge(birthDate: string | Date, minAge = 0, maxAge = 150): boolean {
  if (!validateDate(birthDate)) return false
  
  const birth = new Date(birthDate)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) 
    ? age - 1 
    : age
  
  return actualAge >= minAge && actualAge <= maxAge
}

// Generic field validation
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} é obrigatório`
  }
  return null
}

export function validateLength(
  value: string, 
  fieldName: string, 
  min?: number, 
  max?: number
): string | null {
  if (!value) return null
  
  if (min && value.length < min) {
    return `${fieldName} deve ter pelo menos ${min} caracteres`
  }
  
  if (max && value.length > max) {
    return `${fieldName} deve ter no máximo ${max} caracteres`
  }
  
  return null
}

// Rate limiting helper
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>()
  
  return (identifier: string): boolean => {
    const now = Date.now()
    const windowStart = now - windowMs
    
    if (!requests.has(identifier)) {
      requests.set(identifier, [])
    }
    
    const userRequests = requests.get(identifier)!
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart)
    
    if (validRequests.length >= maxRequests) {
      return false // Rate limit exceeded
    }
    
    validRequests.push(now)
    requests.set(identifier, validRequests)
    
    return true // Request allowed
  }
}