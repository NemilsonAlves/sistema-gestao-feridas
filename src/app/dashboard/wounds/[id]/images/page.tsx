'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Camera, 
  FileImage, 
  Upload,
  Eye,
  Calendar,
  MapPin,
  User,
  Loader2
} from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import { ImageGallery } from '@/components/ui/image-gallery'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Wound {
  id: string
  anatomicalRegion: string
  type: string
  stage?: string
  status: string
  createdAt: string
  patient: {
    id: string
    name: string
  }
  _count: {
    images: number
  }
}

export default function WoundImagesPage() {
  const params = useParams()
  const router = useRouter()
  const woundId = params.id as string

  const [wound, setWound] = useState<Wound | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [imageCount, setImageCount] = useState(0)

  const loadWound = async () => {
    try {
      const response = await fetch(`/api/wounds/${woundId}`)
      if (response.ok) {
        const data = await response.json()
        setWound(data.wound)
        setImageCount(data.wound._count?.images || 0)
      } else {
        router.push('/dashboard/wounds')
      }
    } catch (error) {
      console.error('Erro ao carregar ferida:', error)
      router.push('/dashboard/wounds')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWound()
  }, [woundId])

  const handleUploadComplete = (uploadedImages: any[]) => {
    setImageCount(prev => prev + uploadedImages.length)
    setShowUpload(false)
  }

  const handleImageUpdate = () => {
    // Recarregar contagem de imagens
    loadWound()
  }

  const getWoundTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      ULCERA_PRESSAO: 'Úlcera por Pressão',
      ULCERA_DIABETICA: 'Úlcera Diabética',
      FERIDA_CIRURGICA: 'Ferida Cirúrgica',
      QUEIMADURA: 'Queimadura',
      LESAO_FRICCAO: 'Lesão por Fricção',
      OUTRAS: 'Outras'
    }
    return types[type] || type
  }

  const getWoundStageLabel = (stage?: string) => {
    if (!stage) return null
    const stages: Record<string, string> = {
      ESTAGIO_I: 'Estágio I',
      ESTAGIO_II: 'Estágio II',
      ESTAGIO_III: 'Estágio III',
      ESTAGIO_IV: 'Estágio IV'
    }
    return stages[stage] || stage
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CICATRIZANDO: 'bg-green-100 text-green-800',
      ESTAVEL: 'bg-blue-100 text-blue-800',
      DETERIORANDO: 'bg-yellow-100 text-yellow-800',
      INFECTADA: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      CICATRIZANDO: 'Cicatrizando',
      ESTAVEL: 'Estável',
      DETERIORANDO: 'Deteriorando',
      INFECTADA: 'Infectada'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!wound) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ferida não encontrada</h2>
        <Button onClick={() => router.push('/dashboard/wounds')}>
          Voltar para Feridas
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/wounds/${woundId}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Imagens da Ferida
            </h1>
            <p className="text-gray-500">
              Documentação fotográfica e evolução visual
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <FileImage className="h-3 w-3" />
            <span>{imageCount} imagens</span>
          </Badge>
          
          <Button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center space-x-2"
          >
            {showUpload ? (
              <>
                <Eye className="h-4 w-4" />
                <span>Ver Galeria</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Adicionar Imagens</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Informações da Ferida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Informações da Ferida</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Localização</label>
              <p className="text-sm font-semibold">{wound.anatomicalRegion}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Tipo</label>
              <p className="text-sm font-semibold">{getWoundTypeLabel(wound.type)}</p>
            </div>
            
            {wound.stage && (
              <div>
                <label className="text-sm font-medium text-gray-500">Estágio</label>
                <p className="text-sm font-semibold">{getWoundStageLabel(wound.stage)}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <Badge className={getStatusColor(wound.status)}>
                {getStatusLabel(wound.status)}
              </Badge>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">Paciente</label>
                <p className="text-sm font-semibold">{wound.patient.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">Data de Cadastro</label>
                <p className="text-sm font-semibold">
                  {format(new Date(wound.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload de Imagens */}
      {showUpload && (
        <ImageUpload
          woundId={woundId}
          onUploadComplete={handleUploadComplete}
          maxFiles={10}
          maxSize={5}
        />
      )}

      {/* Galeria de Imagens */}
      {!showUpload && (
        <ImageGallery
          woundId={woundId}
          onImageUpdate={handleImageUpdate}
        />
      )}

      {/* Dicas de Uso */}
      {imageCount === 0 && !showUpload && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Comece a documentar a ferida
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Adicione fotos para acompanhar a evolução da ferida ao longo do tempo. 
                Isso ajuda no diagnóstico e no planejamento do tratamento.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📸 Qualidade da Foto</h4>
                  <p className="text-sm text-blue-700">
                    Use boa iluminação e mantenha a câmera estável para fotos nítidas.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">📏 Referência de Tamanho</h4>
                  <p className="text-sm text-green-700">
                    Inclua uma régua ou objeto de referência para dimensionar a ferida.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">📝 Descrição Detalhada</h4>
                  <p className="text-sm text-purple-700">
                    Adicione descrições para documentar características importantes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}