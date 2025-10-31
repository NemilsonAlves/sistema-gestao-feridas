'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'

interface Patient {
  id: string
  name: string
  cpf: string
  email?: string
  phone?: string
  birthDate: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  isActive: boolean
  createdAt: string
  wounds: Array<{
    id: string
    status: string
  }>
}

interface PatientsResponse {
  patients: Patient[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const router = useRouter()

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(search, 300)

  const fetchPatients = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/patients?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar pacientes')
      }

      const data: PatientsResponse = await response.json()
      setPatients(data.patients)
      setPagination(data.pagination)
    } catch (error) {
      toast.error('Erro ao carregar pacientes')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients(currentPage, debouncedSearch)
  }, [currentPage, debouncedSearch])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const getGenderLabel = (gender: string) => {
    const labels = {
      MALE: 'Masculino',
      FEMALE: 'Feminino',
      OTHER: 'Outro',
    }
    return labels[gender as keyof typeof labels] || gender
  }

  const getAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const getActiveWoundsCount = (wounds: Patient['wounds']) => {
    return wounds.filter(wound => wound.status === 'ACTIVE').length
  }

  if (loading && patients.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-600 mt-2">
              Gerencie o cadastro e histórico dos pacientes
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline">
                ← Voltar ao Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/patients/new">
              <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                + Novo Paciente
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome, CPF ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total de Pacientes</p>
                  <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pacientes Ativos</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {patients.filter(p => p.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🩹</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Com Feridas Ativas</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {patients.filter(p => getActiveWoundsCount(p.wounds) > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients List */}
        <div className="grid gap-4">
          {patients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {patient.name}
                          </h3>
                          <Badge variant={patient.isActive ? "default" : "secondary"}>
                            {patient.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                          {getActiveWoundsCount(patient.wounds) > 0 && (
                            <Badge variant="destructive">
                              {getActiveWoundsCount(patient.wounds)} ferida(s) ativa(s)
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                          <span>CPF: {patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</span>
                          <span>{getAge(patient.birthDate)} anos</span>
                          <span>{getGenderLabel(patient.gender)}</span>
                          {patient.phone && <span>📞 {patient.phone}</span>}
                          {patient.email && <span>✉️ {patient.email}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/patients/${patient.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Link href={`/dashboard/patients/${patient.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {patients.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-gray-400">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum paciente encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                {search ? 'Tente ajustar os filtros de busca.' : 'Comece cadastrando seu primeiro paciente.'}
              </p>
              <Link href="/dashboard/patients/new">
                <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                  + Cadastrar Primeiro Paciente
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Página {currentPage} de {pagination.pages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
              disabled={currentPage === pagination.pages}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}