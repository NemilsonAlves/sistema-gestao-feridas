'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'

interface WoundFormData {
  location: string
  type: string
  stage: string
  length: string
  width: string
  depth: string
  area: string
  tissueType: string
  exudate: string
  exudateType: string
  odor: string
  pain: string
  edema: boolean
  infection: boolean
  temperature: string
  periwoundSkin: string
  description: string
  riskFactors: string
  previousTreatments: string
  status: string
}

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
  patient: {
    id: string
    name: string
    cpf: string
  }
}

export default function EditWoundPage() {
  const [formData, setFormData] = useState<WoundFormData>({
    location: '',
    type: '',
    stage: '',
    length: '',
    width: '',
    depth: '',
    area: '',
    tissueType: '',
    exudate: '',
    exudateType: '',
    odor: '',
    pain: '',
    edema: false,
    infection: false,
    temperature: '',
    periwoundSkin: '',
    description: '',
    riskFactors: '',
    previousTreatments: '',
    status: '',
  })
  const [wound, setWound] = useState<Wound | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
      setWound(data)

      // Preencher formulário com dados existentes
      setFormData({
        location: data.location || '',
        type: data.type || '',
        stage: data.stage || '',
        length: data.length?.toString() || '',
        width: data.width?.toString() || '',
        depth: data.depth?.toString() || '',
        area: data.area?.toString() || '',
        tissueType: data.tissueType || '',
        exudate: data.exudate || '',
        exudateType: data.exudateType || '',
        odor: data.odor || '',
        pain: data.pain?.toString() || '',
        edema: data.edema || false,
        infection: data.infection || false,
        temperature: data.temperature || '',
        periwoundSkin: data.periwoundSkin || '',
        description: data.description || '',
        riskFactors: data.riskFactors || '',
        previousTreatments: data.previousTreatments || '',
        status: data.status || '',
      })
    } catch (error: any) {
      setError(error.message)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof WoundFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Calcular área automaticamente se comprimento e largura forem fornecidos
    if (field === 'length' || field === 'width') {
      const length = field === 'length' ? parseFloat(value as string) : parseFloat(formData.length)
      const width = field === 'width' ? parseFloat(value as string) : parseFloat(formData.width)
      
      if (length && width && !isNaN(length) && !isNaN(width)) {
        setFormData(prev => ({
          ...prev,
          area: (length * width).toFixed(2)
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validações básicas
      if (!formData.location.trim()) {
        toast.error('Localização da ferida é obrigatória')
        return
      }

      if (!formData.type) {
        toast.error('Tipo da ferida é obrigatório')
        return
      }

      // Preparar dados para envio
      const dataToSend = {
        location: formData.location.trim(),
        type: formData.type,
        stage: formData.stage || undefined,
        length: formData.length ? parseFloat(formData.length) : undefined,
        width: formData.width ? parseFloat(formData.width) : undefined,
        depth: formData.depth ? parseFloat(formData.depth) : undefined,
        area: formData.area ? parseFloat(formData.area) : undefined,
        tissueType: formData.tissueType || undefined,
        exudate: formData.exudate || undefined,
        exudateType: formData.exudateType || undefined,
        odor: formData.odor || undefined,
        pain: formData.pain ? parseInt(formData.pain) : undefined,
        edema: formData.edema,
        infection: formData.infection,
        temperature: formData.temperature || undefined,
        periwoundSkin: formData.periwoundSkin || undefined,
        description: formData.description.trim() || undefined,
        riskFactors: formData.riskFactors.trim() || undefined,
        previousTreatments: formData.previousTreatments.trim() || undefined,
        status: formData.status,
      }

      const response = await fetch(`/api/wounds/${woundId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao atualizar ferida')
      }

      toast.success('Ferida atualizada com sucesso!')
      router.push(`/dashboard/wounds/${woundId}`)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar ferida')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !wound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error || 'Ferida não encontrada'}
              </h2>
              <p className="text-gray-600 mb-6">
                Não foi possível carregar os dados da ferida para edição.
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Ferida</h1>
            <p className="text-gray-600 mt-2">
              Paciente: {wound.patient.name} • CPF: {formatCPF(wound.patient.cpf)}
            </p>
          </div>
          <Link href={`/dashboard/wounds/${woundId}`}>
            <Button variant="outline">
              ← Voltar para Detalhes
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados fundamentais da ferida
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Localização da Ferida *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ex: Calcanhar direito, Sacro, etc."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Ferida *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
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

                <div className="space-y-2">
                  <Label htmlFor="stage">Estágio (se aplicável)</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value) => handleInputChange('stage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estágio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STAGE_1">Estágio 1</SelectItem>
                      <SelectItem value="STAGE_2">Estágio 2</SelectItem>
                      <SelectItem value="STAGE_3">Estágio 3</SelectItem>
                      <SelectItem value="STAGE_4">Estágio 4</SelectItem>
                      <SelectItem value="UNSTAGEABLE">Não Classificável</SelectItem>
                      <SelectItem value="SUSPECTED_DTI">Suspeita de LTI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status da Ferida</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Ativa</SelectItem>
                      <SelectItem value="HEALING">Cicatrizando</SelectItem>
                      <SelectItem value="HEALED">Cicatrizada</SelectItem>
                      <SelectItem value="INFECTED">Infectada</SelectItem>
                      <SelectItem value="DETERIORATING">Deteriorando</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimensões */}
          <Card>
            <CardHeader>
              <CardTitle>Dimensões</CardTitle>
              <CardDescription>
                Medidas da ferida em centímetros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="length">Comprimento (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.length}
                    onChange={(e) => handleInputChange('length', e.target.value)}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="width">Largura (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.width}
                    onChange={(e) => handleInputChange('width', e.target.value)}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depth">Profundidade (cm)</Label>
                  <Input
                    id="depth"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.depth}
                    onChange={(e) => handleInputChange('depth', e.target.value)}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Área (cm²)</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    placeholder="Calculado automaticamente"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Características da Ferida */}
          <Card>
            <CardHeader>
              <CardTitle>Características da Ferida</CardTitle>
              <CardDescription>
                Avaliação clínica detalhada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tissueType">Tipo de Tecido</Label>
                  <Select
                    value={formData.tissueType}
                    onValueChange={(value) => handleInputChange('tissueType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de tecido" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRANULATION">Granulação</SelectItem>
                      <SelectItem value="EPITHELIAL">Epitelial</SelectItem>
                      <SelectItem value="SLOUGH">Esfacelo</SelectItem>
                      <SelectItem value="NECROTIC">Necrótico</SelectItem>
                      <SelectItem value="MIXED">Misto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exudate">Quantidade de Exsudato</Label>
                  <Select
                    value={formData.exudate}
                    onValueChange={(value) => handleInputChange('exudate', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a quantidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Ausente</SelectItem>
                      <SelectItem value="MINIMAL">Mínimo</SelectItem>
                      <SelectItem value="MODERATE">Moderado</SelectItem>
                      <SelectItem value="HEAVY">Abundante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exudateType">Tipo de Exsudato</Label>
                  <Select
                    value={formData.exudateType}
                    onValueChange={(value) => handleInputChange('exudateType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEROUS">Seroso</SelectItem>
                      <SelectItem value="SANGUINEOUS">Sanguinolento</SelectItem>
                      <SelectItem value="SEROSANGUINEOUS">Serossanguinolento</SelectItem>
                      <SelectItem value="PURULENT">Purulento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="odor">Odor</Label>
                  <Select
                    value={formData.odor}
                    onValueChange={(value) => handleInputChange('odor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a intensidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Ausente</SelectItem>
                      <SelectItem value="MILD">Leve</SelectItem>
                      <SelectItem value="MODERATE">Moderado</SelectItem>
                      <SelectItem value="STRONG">Forte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Select
                    value={formData.temperature}
                    onValueChange={(value) => handleInputChange('temperature', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a temperatura" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="WARM">Morna</SelectItem>
                      <SelectItem value="HOT">Quente</SelectItem>
                      <SelectItem value="COOL">Fria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periwoundSkin">Pele Perilesional</Label>
                  <Select
                    value={formData.periwoundSkin}
                    onValueChange={(value) => handleInputChange('periwoundSkin', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a condição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTACT">Íntegra</SelectItem>
                      <SelectItem value="MACERATED">Macerada</SelectItem>
                      <SelectItem value="EXCORIATED">Escoriada</SelectItem>
                      <SelectItem value="INDURATED">Endurecida</SelectItem>
                      <SelectItem value="ERYTHEMATOUS">Eritematosa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pain">Dor (0-10)</Label>
                  <Input
                    id="pain"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.pain}
                    onChange={(e) => handleInputChange('pain', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="edema"
                    checked={formData.edema}
                    onCheckedChange={(checked) => handleInputChange('edema', checked as boolean)}
                  />
                  <Label htmlFor="edema">Edema presente</Label>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="infection"
                    checked={formData.infection}
                    onCheckedChange={(checked) => handleInputChange('infection', checked as boolean)}
                  />
                  <Label htmlFor="infection">Sinais de infecção</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
              <CardDescription>
                Descrições e observações complementares
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição Geral</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva as características gerais da ferida"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="riskFactors">Fatores de Risco</Label>
                <Textarea
                  id="riskFactors"
                  value={formData.riskFactors}
                  onChange={(e) => handleInputChange('riskFactors', e.target.value)}
                  placeholder="Liste os fatores de risco identificados"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousTreatments">Tratamentos Anteriores</Label>
                <Textarea
                  id="previousTreatments"
                  value={formData.previousTreatments}
                  onChange={(e) => handleInputChange('previousTreatments', e.target.value)}
                  placeholder="Descreva tratamentos já realizados"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end space-x-4">
            <Link href={`/dashboard/wounds/${woundId}`}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
            >
              {submitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}