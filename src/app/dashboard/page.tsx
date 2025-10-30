'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserRole } from '@prisma/client'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  const getRoleLabel = (role: UserRole) => {
    const roleLabels = {
      [UserRole.DOCTOR]: 'Médico',
      [UserRole.NURSE]: 'Enfermeiro(a)',
      [UserRole.PHYSIOTHERAPIST]: 'Fisioterapeuta',
      [UserRole.NUTRITIONIST]: 'Nutricionista',
      [UserRole.ADMIN]: 'Administrador',
    }
    return roleLabels[role] || role
  }

  const getRoleColor = (role: UserRole) => {
    const roleColors = {
      [UserRole.DOCTOR]: 'bg-blue-100 text-blue-800',
      [UserRole.NURSE]: 'bg-green-100 text-green-800',
      [UserRole.PHYSIOTHERAPIST]: 'bg-purple-100 text-purple-800',
      [UserRole.NUTRITIONIST]: 'bg-orange-100 text-orange-800',
      [UserRole.ADMIN]: 'bg-red-100 text-red-800',
    }
    return roleColors[role] || 'bg-gray-100 text-gray-800'
  }

  const dashboardCards = [
    {
      title: 'Pacientes',
      description: 'Gerenciar cadastro e histórico de pacientes',
      icon: '👥',
      href: '/dashboard/patients',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Feridas',
      description: 'Avaliação e acompanhamento de feridas',
      icon: '🩹',
      href: '/dashboard/wounds',
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'Tratamentos',
      description: 'Protocolos e curativos',
      icon: '💊',
      href: '/dashboard/treatments',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Telemedicina',
      description: 'Acompanhamento remoto pós-alta',
      icon: '📱',
      href: '/dashboard/telemedicine',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Relatórios',
      description: 'Indicadores e KPIs de gestão',
      icon: '📊',
      href: '/dashboard/reports',
      color: 'from-teal-500 to-teal-600',
    },
    {
      title: 'Configurações',
      description: 'Configurações do sistema',
      icon: '⚙️',
      href: '/dashboard/settings',
      color: 'from-gray-500 to-gray-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Central de Pele</h1>
                <p className="text-sm text-gray-500">Sistema de Gestão de Feridas e Curativos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  {user.specialty && (
                    <span className="text-xs text-gray-500">{user.specialty}</span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo, {user.name.split(' ')[0]}!
          </h2>
          <p className="text-gray-600">
            Selecione um módulo para começar a trabalhar
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                      {card.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Rápido</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pacientes Ativos</p>
                    <p className="text-2xl font-semibold text-gray-900">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 font-semibold">🩹</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Feridas em Tratamento</p>
                    <p className="text-2xl font-semibold text-gray-900">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-semibold">💊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tratamentos Hoje</p>
                    <p className="text-2xl font-semibold text-gray-900">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">📱</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Consultas Remotas</p>
                    <p className="text-2xl font-semibold text-gray-900">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}