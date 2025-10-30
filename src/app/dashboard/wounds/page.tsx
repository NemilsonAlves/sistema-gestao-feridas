'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Wound {
  id: string
  location: string
  type: string
  stage?: string
  status: string
  length?: number
  width?: number
  depth?: number
  area?: number
  pain?: number
  infection: boolean
  createdAt: string
  updatedAt: string
  patient: {
    id: string
    name: string
    cpf: string
    isActive: boolean
  }
  createdBy: {
    id: string
    name: string
    role: string
  }
  _count: {
    treatments: number
    images: number
  }
}

interface Statistics {
  total: number
  active: number
  healing: number
  healed: number
  infected: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function WoundsPage() {
  const [wounds, setWounds] = useState<Wound[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    active: 0,
    healing: 0,
    healed: 0,
    infected: 0,
  })
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const fetchWounds = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)

      const response = await fetch(`/api/wounds?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar feridas')
      }

      const data = await response.json()
      setWounds(data.wounds)
      setStatistics(data.statistics)
      setPagination(data.pagination)
    } catch (error) {
      toast.error('Erro ao carregar feridas')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWounds()
  }, [pagination.page, search, statusFilter, typeFilter])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value === 'all' ? '' : value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      PRESSURE_ULCER: 'Úlcera por Pressão',
      DIABETIC_ULCER: 'Úlcera Diabética',
      VENOUS_ULCER: 'Úlcera Venosa',
      ARTERIAL_ULCER: 'Úlcera Arterial',
      SURGICAL: 'Cirúrgica',
      TRAUMATIC: 'Traumática',
      OTHER: 'Outra',
    }
    return labels[type as keyof typeof labels] || type
  }

  const getStageLabel = (stage?: string) => {
    if (!stage) return ''
    const labels = {
      STAGE_1: 'Estágio 1',
      STAGE_2: 'Estágio 2',
      STAGE_3: 'Estágio 3',
      STAGE_4: 'Estágio 4',
      UNSTAGEABLE: 'Não Classificável',
      SUSPECTED_DTI: 'Suspeita de LTI',
    }
    return labels[stage as keyof typeof labels] || stage
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      ACTIVE: 'Ativa',
      HEALING: 'Cicatrizando',
      HEALED: 'Cicatrizada',
      INFECTED: 'Infectada',
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-yellow-100 text-yellow-800',
      HEALING: 'bg-blue-100 text-blue-800',
      HEALED: 'bg-green-100 text-green-800',
      INFECTED: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDimensions = (wound: Wound) => {
    const parts = []
    if (wound.length) parts.push(`${wound.length}cm`)
    if (wound.width) parts.push(`${wound.width}cm`)
    if (wound.depth) parts.push(`${wound.depth}cm`)
    return parts.join(' × ')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Feridas</h1>
            <p className="text-gray-600 mt-2">
              Acompanhe e gerencie todas as feridas dos pacientes
            </p>
          </div>
          <Link href="/dashboard/wounds/new">
            <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
              + Nova Ferida
            </Button>
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-xl">📋</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativas</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.active}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cicatrizando</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.healing}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">🔄</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cicatrizadas</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.healed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Infectadas</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.infected}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">🦠</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Buscar por localização, paciente..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div>
                <Select value={statusFilter || 'all'} onValueChange={handleStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="ACTIVE">Ativa</SelectItem>
                    <SelectItem value="HEALING">Cicatrizando</SelectItem>
                    <SelectItem value="HEALED">Cicatrizada</SelectItem>
                    <SelectItem value="INFECTED">Infectada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={typeFilter || 'all'} onValueChange={handleTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="PRESSURE_ULCER">Úlcera por Pressão</SelectItem>
                    <SelectItem value="DIABETIC_ULCER">Úlcera Diabética</SelectItem>
                    <SelectItem value="VENOUS_ULCER">Úlcera Venosa</SelectItem>
                    <SelectItem value="ARTERIAL_ULCER">Úlcera Arterial</SelectItem>
                    <SelectItem value="SURGICAL">Cirúrgica</SelectItem>
                    <SelectItem value="TRAUMATIC">Traumática</SelectItem>
                    <SelectItem value="OTHER">Outra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('')
                    setTypeFilter('')
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Feridas */}
        <Card>
          <CardHeader>
            <CardTitle>Feridas Cadastradas</CardTitle>
            <CardDescription>
              {pagination.total} ferida(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
              </div>
            ) : wounds.length > 0 ? (
              <div className="space-y-4">
                {wounds.map((wound) => (
                  <div key={wound.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {wound.location}
                          </h3>
                          <Badge className={getStatusColor(wound.status)}>
                            {getStatusLabel(wound.status)}
                          </Badge>
                          {wound.infection && (
                            <Badge className="bg-red-100 text-red-800">
                              Infectada
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Paciente</p>
                            <p className="font-medium">
                              <Link 
                                href={`/dashboard/patients/${wound.patient.id}`}
                                className="text-teal-600 hover:text-teal-700"
                              >
                                {wound.patient.name}
                              </Link>
                            </p>
                            <p className="text-xs text-gray-500">
                              CPF: {formatCPF(wound.patient.cpf)}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600">Tipo</p>
                            <p className="font-medium">{getTypeLabel(wound.type)}</p>
                            {wound.stage && (
                              <p className="text-xs text-gray-500">
                                {getStageLabel(wound.stage)}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-gray-600">Dimensões</p>
                            <p className="font-medium">
                              {formatDimensions(wound) || 'Não informado'}
                            </p>
                            {wound.area && (
                              <p className="text-xs text-gray-500">
                                Área: {wound.area} cm²
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-gray-600">Dor</p>
                            <p className="font-medium">
                              {wound.pain !== undefined ? `${wound.pain}/10` : 'Não avaliada'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {wound._count.treatments} tratamento(s)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div>
                            <span>Cadastrada em {formatDate(wound.createdAt)}</span>
                            <span className="mx-2">•</span>
                            <span>por {wound.createdBy.name}</span>
                          </div>
                          <div>
                            <span>{wound._count.images} imagem(ns)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/dashboard/wounds/${wound.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                        <Link href={`/dashboard/wounds/${wound.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Paginação */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between pt-6">
                    <p className="text-sm text-gray-600">
                      Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                      {pagination.total} feridas
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-gray-600">
                        Página {pagination.page} de {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.pages}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-4xl">🩹</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma ferida encontrada
                </h3>
                <p className="text-gray-600 mb-6">
                  {search || statusFilter || typeFilter
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Comece cadastrando a primeira ferida.'}
                </p>
                <Link href="/dashboard/wounds/new">
                  <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                    + Cadastrar Primeira Ferida
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}