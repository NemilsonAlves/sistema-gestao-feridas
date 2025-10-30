import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from './lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/health',
    '/login',
    '/register',
    '/',
  ]

  // Rotas da API que precisam de autenticação
  const protectedApiRoutes = [
    '/api/patients',
    '/api/wounds',
    '/api/treatments',
    '/api/appointments',
    '/api/reports',
    '/api/telemedicine',
    '/api/users',
  ]

  // Rotas do dashboard que precisam de autenticação
  const protectedDashboardRoutes = [
    '/dashboard',
    '/patients',
    '/wounds',
    '/treatments',
    '/appointments',
    '/reports',
    '/telemedicine',
    '/profile',
  ]

  // Verificar se é uma rota pública
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar se é uma rota protegida
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route))
  const isProtectedDashboard = protectedDashboardRoutes.some(route => pathname.startsWith(route))

  if (isProtectedApi || isProtectedDashboard) {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      if (isProtectedApi) {
        return NextResponse.json(
          { error: 'Token de acesso requerido' },
          { status: 401 }
        )
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    const payload = AuthService.verifyToken(token)
    if (!payload) {
      if (isProtectedApi) {
        return NextResponse.json(
          { error: 'Token inválido ou expirado' },
          { status: 401 }
        )
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // Adicionar informações do usuário aos headers para uso nas rotas da API
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-email', payload.email)
    requestHeaders.set('x-user-role', payload.role)
    requestHeaders.set('x-user-name', payload.name)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}