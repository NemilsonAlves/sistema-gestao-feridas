'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit
} from 'lucide-react'

interface Treatment {
  id: string
  type: string
  description: string
  products: string[]
  frequency?: string
  duration?: string
  instructions?: string
  nextScheduled?: string
  performedBy?: string
  observations?: string
  status: string
  completedAt?: string
  createdAt: string
  wound: {
    id: string
    location: string
    type: string
    patient: {
      id: string
      name: string
      cpf: string
    }
  }
  createdBy: {
    name: string
    role: string
  }
}

interface Statistics {
  total: number
  scheduled: number
  completed: number
  cancelled: number
  overdue: number
}

const typeLabels: Record<string, string> = {
  DRESSING: 'Curativo',
  MEDICATION: 'Medicação',
  DEBRIDEMENT: 'Desbridamento',
  THERAPY: 'Terapia',
  OTHER: 'Outro'
}

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Agendado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  OVERDUE: 'Atrasado'
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  OVERDUE: 'bg-red-100 text-red-800'
}

const statusIcons: Record<string, any> = {
  SCHEDULED: Clock,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
  OVERDUE: AlertTriangle
}

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchTreatments()
  }, [currentPage, searchTerm, typeFilter, statusFilter])

  const fetchTreatments = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (searchTerm) params.append('search', searchTerm)
      if (typeFilter) params.append('type', typeFilter)
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/treatments?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar tratamentos')
      }

      const data = await response.json()
      setTreatments(data.treatments)
      setStatistics(data.statistics)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      toast.error('Erro ao carregar tratamentos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value === 'all' ? '' : value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value)
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const isOverdue = (treatment: Treatment) => {
    if (!treatment.nextScheduled || treatment.status === 'COMPLETED') return false
    return new Date(treatment.nextScheduled) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Tratamentos</h1>
            <p className="text-gray-600 mt-2">
              Gerencie os tratamentos e acompanhamentos das feridas
            </p>
          </div>
          <Link href="/dashboard/treatments/new">
            <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Tratamento
            </Button>
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Agendados</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.scheduled}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Concluídos</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Atrasados</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cancelados</p>
                  <p className="text-2xl font-bold text-gray-600">{statistics.cancelled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por descrição, instruções ou responsável..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter || 'all'} onValueChange={handleTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="DRESSING">Curativo</SelectItem>
                  <SelectItem value="MEDICATION">Medicação</SelectItem>
                  <SelectItem value="DEBRIDEMENT">Desbridamento</SelectItem>
                  <SelectItem value="THERAPY">Terapia</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter || 'all'} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="SCHEDULED">Agendado</SelectItem>
                  <SelectItem value="COMPLETED">Concluído</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  <SelectItem value="OVERDUE">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Tratamentos */}
        <div className="space-y-4">
          {treatments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum tratamento encontrado
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  {searchTerm || typeFilter || statusFilter
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Comece cadastrando o primeiro tratamento.'}
                </p>
                <Link href="/dashboard/treatments/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Tratamento
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            treatments.map((treatment) => {
              const StatusIcon = statusIcons[treatment.status]
              const isLate = isOverdue(treatment)
              
              return (
                <Card key={treatment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {typeLabels[treatment.type]}
                          </h3>
                          <Badge className={statusColors[treatment.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusLabels[treatment.status]}
                          </Badge>
                          {isLate && treatment.status === 'SCHEDULED' && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Atrasado
                            </Badge>
                          )}
                        </div>

                        <p className="text-gray-700 mb-4">{treatment.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            <div>
                              <div className="font-medium">{treatment.wound.patient.name}</div>
                              <div>CPF: {formatCPF(treatment.wound.patient.cpf)}</div>
                            </div>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <div>
                              <div className="font-medium">Ferida</div>
                              <div>{treatment.wound.location}</div>
                            </div>
                          </div>

                          {treatment.nextScheduled && (
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <div>
                                <div className="font-medium">Próximo</div>
                                <div>{formatDate(treatment.nextScheduled)}</div>
                              </div>
                            </div>
                          )}

                          {treatment.performedBy && (
                            <div className="flex items-center text-gray-600">
                              <User className="h-4 w-4 mr-2" />
                              <div>
                                <div className="font-medium">Responsável</div>
                                <div>{treatment.performedBy}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {treatment.products && treatment.products.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium text-gray-700 mb-1">Produtos:</div>
                            <div className="flex flex-wrap gap-1">
                              {treatment.products.map((product, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {product}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="text-sm text-gray-500">
                            Cadastrado em {formatDate(treatment.createdAt)} por {treatment.createdBy.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Link href={`/dashboard/treatments/${treatment.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/treatments/${treatment.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}