'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface Patient {
  id: string
  name: string
  cpf: string
}

interface WoundFormData {
  patientId: string
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
}

export default function NewWoundPage() {
  const [formData, setFormData] = useState<WoundFormData>({
    patientId: '',
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
  })
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Se há um patientId na URL, definir como selecionado
    const patientId = searchParams.get('patientId')
    if (patientId) {
      setFormData(prev => ({ ...prev, patientId }))
    }

    // Carregar lista de pacientes
    fetchPatients()
  }, [searchParams])

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true)
      const response = await fetch('/api/patients?limit=100')
      if (!response.ok) {
        throw new Error('Erro ao carregar pacientes')
      }

      const data = await response.json()
      setPatients(data.patients)
    } catch (error) {
      toast.error('Erro ao carregar lista de pacientes')
      console.error(error)
    } finally {
      setLoadingPatients(false)
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
      if (!formData.patientId) {
        toast.error('Selecione um paciente')
        return
      }

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
        patientId: formData.patientId,
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
      }

      const response = await fetch('/api/wounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao cadastrar ferida')
      }

      const wound = await response.json()
      toast.success('Ferida cadastrada com sucesso!')
      router.push(`/dashboard/wounds/${wound.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar ferida')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Ferida</h1>
            <p className="text-gray-600 mt-2">
              Cadastre uma nova ferida para acompanhamento
            </p>
          </div>
          <Link href="/dashboard/wounds">
            <Button variant="outline">
              ← Voltar para Feridas
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
                  <Label htmlFor="patientId">Paciente *</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) => handleInputChange('patientId', value)}
                    disabled={loadingPatients}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} - CPF: {patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
            <Link href="/dashboard/wounds">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
            >
              {submitting ? 'Cadastrando...' : 'Cadastrar Ferida'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}