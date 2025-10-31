'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-medical-50 to-medical-100">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-medical-200 border-t-medical-600 mx-auto"></div>
          <h2 className="text-xl font-semibold text-medical-800">Carregando...</h2>
          <p className="text-medical-600">Sistema de Gestão de Feridas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-medical-50 to-medical-100">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-medical-800 mb-2">
            Central de Pele
          </h1>
          <p className="text-xl text-medical-600">
            Sistema de Gestão de Feridas
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-medical-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Bem-vindo!
            </h2>
            <p className="text-gray-600">
              Acesse sua conta para gerenciar pacientes, feridas e tratamentos de forma eficiente.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-medical-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-medical-700 transition-colors"
            >
              Fazer Login
            </button>
            <button
              onClick={() => router.push('/register')}
              className="w-full border border-medical-300 text-medical-600 py-3 px-4 rounded-lg font-medium hover:bg-medical-50 transition-colors"
            >
              Criar Conta
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-medical-500">
          <p>© 2024 Central de Pele - Sistema de Gestão de Feridas</p>
        </div>
      </div>
    </div>
  )
}
