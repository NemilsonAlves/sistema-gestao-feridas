'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Plus, X, User, MapPin } from 'lucide-react'
import Link from 'next/link'

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
  wound: {
    id: string
    location: string
    type: string
    stage: string
    patient: {
      id: string
      name: string
      cpf: string
    }
  }
}

interface FormData {
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
  CANCELLED: 'Cancelado'
}

export default function EditTreatmentPage() {
  const params = useParams()
  const router = useRouter()
  const [treatment, setTreatment] = useState<Treatment | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newProduct, setNewProduct] = useState('')
  const [formData, setFormData] = useState<FormData>({
    type: '',
    description: '',
    products: [],
    frequency: '',
    duration: '',
    instructions: '',
    nextScheduled: '',
    performedBy: '',
    observations: '',
    status: 'SCHEDULED'
  })

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
      
      // Preencher formulário com dados existentes
      setFormData({
        type: data.type,
        description: data.description,
        products: data.products || [],
        frequency: data.frequency || '',
        duration: data.duration || '',
        instructions: data.instructions || '',
        nextScheduled: data.nextScheduled ? 
          new Date(data.nextScheduled).toISOString().slice(0, 16) : '',
        performedBy: data.performedBy || '',
        observations: data.observations || '',
        status: data.status
      })
    } catch (error) {
      toast.error('Erro ao carregar tratamento')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addProduct = () => {
    if (newProduct.trim() && !formData.products.includes(newProduct.trim())) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, newProduct.trim()]
      }))
      setNewProduct('')
    }
  }

  const removeProduct = (product: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p !== product)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addProduct()
    }
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type || !formData.description) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      setSaving(true)

      const submitData = {
        ...formData,
        nextScheduled: formData.nextScheduled ? new Date(formData.nextScheduled).toISOString() : null,
        completedAt: formData.status === 'COMPLETED' && treatment?.status !== 'COMPLETED' 
          ? new Date().toISOString() 
          : treatment?.completedAt
      }

      const response = await fetch(`/api/treatments/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao atualizar tratamento')
      }

      toast.success('Tratamento atualizado com sucesso!')
      router.push(`/dashboard/treatments/${params.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar tratamento')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!treatment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href={`/dashboard/treatments/${treatment.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Tratamento</h1>
            <p className="text-gray-600 mt-2">
              Atualize as informações do tratamento
            </p>
          </div>
        </div>

        {/* Informações da Ferida e Paciente */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações da Ferida e Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">{treatment.wound.patient.name}</div>
                  <div className="text-sm text-gray-600">CPF: {formatCPF(treatment.wound.patient.cpf)}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">{treatment.wound.location}</div>
                  <div className="text-sm text-gray-600">{treatment.wound.type} - Estágio {treatment.wound.stage}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados principais do tratamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Tratamento *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Tratamento *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o tratamento a ser realizado..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Produtos e Materiais */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos e Materiais</CardTitle>
              <CardDescription>
                Liste os produtos e materiais utilizados no tratamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite o nome do produto..."
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button type="button" onClick={addProduct} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.products.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.products.map((product, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{product}</span>
                      <button
                        type="button"
                        onClick={() => removeProduct(product)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Programação e Frequência */}
          <Card>
            <CardHeader>
              <CardTitle>Programação e Frequência</CardTitle>
              <CardDescription>
                Configure a frequência e duração do tratamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequência</Label>
                  <Input
                    id="frequency"
                    placeholder="Ex: 2x ao dia, diário, semanal..."
                    value={formData.frequency}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração</Label>
                  <Input
                    id="duration"
                    placeholder="Ex: 7 dias, 2 semanas, 1 mês..."
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nextScheduled">Próximo Agendamento</Label>
                  <Input
                    id="nextScheduled"
                    type="datetime-local"
                    value={formData.nextScheduled}
                    onChange={(e) => handleInputChange('nextScheduled', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="performedBy">Responsável pela Execução</Label>
                  <Input
                    id="performedBy"
                    placeholder="Nome do profissional responsável..."
                    value={formData.performedBy}
                    onChange={(e) => handleInputChange('performedBy', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instruções e Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Instruções e Observações</CardTitle>
              <CardDescription>
                Informações adicionais sobre o tratamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructions">Instruções de Execução</Label>
                <Textarea
                  id="instructions"
                  placeholder="Descreva como o tratamento deve ser executado..."
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  placeholder="Observações adicionais, cuidados especiais, etc..."
                  value={formData.observations}
                  onChange={(e) => handleInputChange('observations', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Link href={`/dashboard/treatments/${treatment.id}`}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}