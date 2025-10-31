import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from './lib/auth'

export function proxy(request: NextRequest) {
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
    '/api/images',
  ]

  // Rotas especiais que precisam de autenticação mas têm tratamento diferente
  const specialAuthRoutes = [
    '/api/auth/me',
    '/api/auth/logout',
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

  // Verificar se é uma rota especial de autenticação
  if (specialAuthRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Para rotas protegidas da API, verificar autenticação via header
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      )
    }

    // Adicionar o userId ao header para as rotas da API
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', userId)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Para rotas do dashboard, verificar autenticação via cookie
  if (protectedDashboardRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const user = AuthService.verifyToken(token)
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}