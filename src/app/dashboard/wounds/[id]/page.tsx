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
  Calendar, 
  MapPin, 
  Ruler, 
  Thermometer, 
  Droplets, 
  AlertTriangle,
  User,
  Edit,
  Camera,
  Activity,
  FileText
} from 'lucide-react'

interface Wound {
  id: string
  location: string
  type: string
  stage?: string
  length?: number
  width?: number
  depth?: number
  area?: number
  tissueType?: string
  exudate?: string
  exudateType?: string
  odor?: string
  pain?: number
  edema: boolean
  infection: boolean
  temperature?: string
  periwoundSkin?: string
  description?: string
  riskFactors?: string
  previousTreatments?: string
  status: string
  createdAt: string
  updatedAt: string
  patient: {
    id: string
    name: string
    cpf: string
  }
  createdBy: {
    name: string
    role: string
  }
  _count?: {
    images: number
  }
  recentImages?: Array<{
    id: string
    url: string
    filename: string
    createdAt: string
  }>
}

const typeLabels: Record<string, string> = {
  PRESSURE_ULCER: 'Úlcera por Pressão',
  DIABETIC_ULCER: 'Úlcera Diabética',
  VENOUS_ULCER: 'Úlcera Venosa',
  ARTERIAL_ULCER: 'Úlcera Arterial',
  SURGICAL: 'Cirúrgica',
  TRAUMATIC: 'Traumática',
  OTHER: 'Outra'
}

const stageLabels: Record<string, string> = {
  STAGE_1: 'Estágio 1',
  STAGE_2: 'Estágio 2',
  STAGE_3: 'Estágio 3',
  STAGE_4: 'Estágio 4',
  UNSTAGEABLE: 'Não Classificável',
  SUSPECTED_DTI: 'Suspeita de LTI'
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'Ativa',
  HEALING: 'Cicatrizando',
  HEALED: 'Cicatrizada',
  INFECTED: 'Infectada',
  DETERIORATING: 'Deteriorando'
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-blue-100 text-blue-800',
  HEALING: 'bg-green-100 text-green-800',
  HEALED: 'bg-gray-100 text-gray-800',
  INFECTED: 'bg-red-100 text-red-800',
  DETERIORATING: 'bg-orange-100 text-orange-800'
}

export default function WoundDetailsPage() {
  const [wound, setWound] = useState<Wound | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const woundId = params.id as string

  useEffect(() => {
    if (woundId) {
      fetchWound()
    }
  }, [woundId])

  const fetchWound = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/wounds/${woundId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ferida não encontrada')
        }
        throw new Error('Erro ao carregar dados da ferida')
      }

      const data = await response.json()
      setWound(data.wound)
    } catch (error: any) {
      setError(error.message)
      toast.error(error.message)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
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

  if (error || !wound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error || 'Ferida não encontrada'}
              </h2>
              <p className="text-gray-600 mb-6">
                Não foi possível carregar os dados da ferida.
              </p>
              <div className="flex space-x-4">
                <Button onClick={() => router.back()} variant="outline">
                  Voltar
                </Button>
                <Button onClick={fetchWound}>
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Ferida - {wound.location}
              </h1>
              <Badge className={statusColors[wound.status]}>
                {statusLabels[wound.status]}
              </Badge>
            </div>
            <p className="text-gray-600">
              Paciente: {wound.patient.name} • CPF: {formatCPF(wound.patient.cpf)}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard/wounds">
              <Button variant="outline">
                ← Voltar para Feridas
              </Button>
            </Link>
            <Link href={`/dashboard/wounds/${wound.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Localização</h4>
                    <p className="text-gray-600">{wound.location}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tipo</h4>
                    <p className="text-gray-600">{typeLabels[wound.type]}</p>
                  </div>
                  {wound.stage && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Estágio</h4>
                      <p className="text-gray-600">{stageLabels[wound.stage]}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                    <Badge className={statusColors[wound.status]}>
                      {statusLabels[wound.status]}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dimensões */}
            {(wound.length || wound.width || wound.depth || wound.area) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Ruler className="h-5 w-5 mr-2" />
                    Dimensões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {wound.length && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">
                          {wound.length}
                        </div>
                        <div className="text-sm text-gray-600">Comprimento (cm)</div>
                      </div>
                    )}
                    {wound.width && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">
                          {wound.width}
                        </div>
                        <div className="text-sm text-gray-600">Largura (cm)</div>
                      </div>
                    )}
                    {wound.depth && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">
                          {wound.depth}
                        </div>
                        <div className="text-sm text-gray-600">Profundidade (cm)</div>
                      </div>
                    )}
                    {wound.area && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">
                          {wound.area}
                        </div>
                        <div className="text-sm text-gray-600">Área (cm²)</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Características Clínicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Características Clínicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wound.tissueType && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Tipo de Tecido</h4>
                      <p className="text-gray-600">{wound.tissueType}</p>
                    </div>
                  )}
                  {wound.exudate && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Exsudato</h4>
                      <p className="text-gray-600">
                        {wound.exudate}
                        {wound.exudateType && ` - ${wound.exudateType}`}
                      </p>
                    </div>
                  )}
                  {wound.odor && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Odor</h4>
                      <p className="text-gray-600">{wound.odor}</p>
                    </div>
                  )}
                  {wound.temperature && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Temperatura</h4>
                      <p className="text-gray-600">{wound.temperature}</p>
                    </div>
                  )}
                  {wound.periwoundSkin && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Pele Perilesional</h4>
                      <p className="text-gray-600">{wound.periwoundSkin}</p>
                    </div>
                  )}
                  {wound.pain !== undefined && wound.pain !== null && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Dor (0-10)</h4>
                      <p className="text-gray-600">{wound.pain}</p>
                    </div>
                  )}
                </div>

                {(wound.edema || wound.infection) && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex flex-wrap gap-4">
                      {wound.edema && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <Droplets className="h-3 w-3 mr-1" />
                          Edema presente
                        </Badge>
                      )}
                      {wound.infection && (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Sinais de infecção
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Descrições */}
            {(wound.description || wound.riskFactors || wound.previousTreatments) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Informações Adicionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {wound.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Descrição Geral</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{wound.description}</p>
                    </div>
                  )}
                  {wound.riskFactors && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Fatores de Risco</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{wound.riskFactors}</p>
                    </div>
                  )}
                  {wound.previousTreatments && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Tratamentos Anteriores</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{wound.previousTreatments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações do Paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{wound.patient.name}</h4>
                    <p className="text-sm text-gray-600">CPF: {formatCPF(wound.patient.cpf)}</p>
                  </div>
                  <Link href={`/dashboard/patients/${wound.patient.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Perfil do Paciente
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Imagens da Ferida */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Imagens da Ferida
                  </div>
                  <Badge variant="secondary">
                    {wound._count?.images || 0} imagens
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {wound.recentImages && wound.recentImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {wound.recentImages.slice(0, 4).map((image: any) => (
                      <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image.url}
                          alt={image.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Nenhuma imagem adicionada</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Link href={`/dashboard/wounds/${wound.id}/images`}>
                    <Button className="w-full justify-start" variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      {wound._count?.images > 0 ? 'Ver Todas as Imagens' : 'Adicionar Primeira Imagem'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/dashboard/treatments/new?woundId=${wound.id}`}>
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Novo Tratamento
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            {/* Informações de Registro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Informações de Registro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Cadastrado em</h4>
                  <p className="text-sm text-gray-600">{formatDate(wound.createdAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Última atualização</h4>
                  <p className="text-sm text-gray-600">{formatDate(wound.updatedAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Cadastrado por</h4>
                  <p className="text-sm text-gray-600">
                    {wound.createdBy.name} ({wound.createdBy.role})
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}