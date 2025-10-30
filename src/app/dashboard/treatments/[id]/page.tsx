'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Package,
  Timer,
  UserCheck,
  Eye,
  Trash2
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
  updatedAt: string
  wound: {
    id: string
    location: string
    type: string
    stage: string
    status: string
    patient: {
      id: string
      name: string
      cpf: string
      email?: string
      phone?: string
    }
  }
  createdBy: {
    id: string
    name: string
    email: string
    role: string
  }
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

export default function TreatmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [treatment, setTreatment] = useState<Treatment | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchTreatment()
    }
  }, [params.id])

  const fetchTreatment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/treatments/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Tratamento não encontrado')
          router.push('/dashboard/treatments')
          return
        }
        throw new Error('Erro ao carregar tratamento')
      }

      const data = await response.json()
      setTreatment(data)
    } catch (error) {
      toast.error('Erro ao carregar tratamento')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!treatment || !confirm('Tem certeza que deseja excluir este tratamento?')) {
      return
    }

    try {
      setDeleting(true)
      const response = await fetch(`/api/treatments/${treatment.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao excluir tratamento')
      }

      toast.success('Tratamento excluído com sucesso!')
      router.push('/dashboard/treatments')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir tratamento')
      console.error(error)
    } finally {
      setDeleting(false)
    }
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

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
  }

  const isOverdue = (treatment: Treatment) => {
    if (!treatment.nextScheduled || treatment.status === 'COMPLETED') return false
    return new Date(treatment.nextScheduled) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!treatment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tratamento não encontrado
            </h2>
            <Link href="/dashboard/treatments">
              <Button>Voltar para Tratamentos</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const StatusIcon = statusIcons[treatment.status]
  const isLate = isOverdue(treatment)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/treatments">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Detalhes do Tratamento
              </h1>
              <p className="text-gray-600 mt-2">
                Informações completas sobre o tratamento
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/dashboard/treatments/${treatment.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-3">
                      <Activity className="h-6 w-6 text-teal-600" />
                      <span>{typeLabels[treatment.type]}</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {treatment.description}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
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
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Programação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {treatment.frequency && (
                    <div className="flex items-center space-x-3">
                      <Timer className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Frequência</div>
                        <div className="text-gray-600">{treatment.frequency}</div>
                      </div>
                    </div>
                  )}

                  {treatment.duration && (
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Duração</div>
                        <div className="text-gray-600">{treatment.duration}</div>
                      </div>
                    </div>
                  )}

                  {treatment.nextScheduled && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Próximo Agendamento</div>
                        <div className="text-gray-600">{formatDate(treatment.nextScheduled)}</div>
                      </div>
                    </div>
                  )}

                  {treatment.performedBy && (
                    <div className="flex items-center space-x-3">
                      <UserCheck className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Responsável</div>
                        <div className="text-gray-600">{treatment.performedBy}</div>
                      </div>
                    </div>
                  )}
                </div>

                {treatment.completedAt && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">
                        Tratamento concluído em {formatDate(treatment.completedAt)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Produtos e Materiais */}
            {treatment.products && treatment.products.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-teal-600" />
                    <span>Produtos e Materiais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {treatment.products.map((product, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instruções */}
            {treatment.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-teal-600" />
                    <span>Instruções de Execução</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {treatment.instructions}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            {treatment.observations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-teal-600" />
                    <span>Observações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {treatment.observations}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações da Ferida */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-teal-600" />
                  <span>Ferida Associada</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium text-gray-900">{treatment.wound.location}</div>
                  <div className="text-sm text-gray-600">
                    {treatment.wound.type} - Estágio {treatment.wound.stage}
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {treatment.wound.status}
                  </Badge>
                </div>
                <Separator />
                <Link href={`/dashboard/wounds/${treatment.wound.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes da Ferida
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Informações do Paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-teal-600" />
                  <span>Paciente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium text-gray-900">
                    {treatment.wound.patient.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    CPF: {formatCPF(treatment.wound.patient.cpf)}
                  </div>
                </div>

                {treatment.wound.patient.email && (
                  <div className="text-sm text-gray-600">
                    Email: {treatment.wound.patient.email}
                  </div>
                )}

                {treatment.wound.patient.phone && (
                  <div className="text-sm text-gray-600">
                    Telefone: {formatPhone(treatment.wound.patient.phone)}
                  </div>
                )}

                <Separator />
                <Link href={`/dashboard/patients/${treatment.wound.patient.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Perfil do Paciente
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Informações de Registro */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Registro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-gray-900">Criado por</div>
                  <div className="text-gray-600">{treatment.createdBy.name}</div>
                  <div className="text-gray-500">{treatment.createdBy.role}</div>
                </div>

                <Separator />

                <div>
                  <div className="font-medium text-gray-900">Data de criação</div>
                  <div className="text-gray-600">{formatDate(treatment.createdAt)}</div>
                </div>

                <div>
                  <div className="font-medium text-gray-900">Última atualização</div>
                  <div className="text-gray-600">{formatDate(treatment.updatedAt)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}