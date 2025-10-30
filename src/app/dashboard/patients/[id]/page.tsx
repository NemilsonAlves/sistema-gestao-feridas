'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface Patient {
  id: string
  name: string
  cpf: string
  rg?: string
  email?: string
  phone?: string
  birthDate: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  address?: string
  city?: string
  state?: string
  zipCode?: string
  emergencyContact?: string
  emergencyPhone?: string
  allergies?: string
  comorbidities?: string
  medications?: string
  observations?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    role: string
  }
  wounds: Array<{
    id: string
    location: string
    type: string
    status: string
    createdAt: string
    treatments: Array<{
      id: string
      createdAt: string
    }>
  }>
  _count: {
    wounds: number
  }
}

export default function PatientDetailsPage() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`/api/patients/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Paciente não encontrado')
            router.push('/dashboard/patients')
            return
          }
          throw new Error('Erro ao carregar paciente')
        }

        const data = await response.json()
        setPatient(data)
      } catch (error) {
        toast.error('Erro ao carregar dados do paciente')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPatient()
    }
  }, [params.id, router])

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

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPhone = (phone: string) => {
    if (phone.length <= 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const formatZipCode = (zipCode: string) => {
    return zipCode.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getWoundStatusLabel = (status: string) => {
    const labels = {
      ACTIVE: 'Ativa',
      HEALING: 'Cicatrizando',
      HEALED: 'Cicatrizada',
      INFECTED: 'Infectada',
    }
    return labels[status as keyof typeof labels] || status
  }

  const getWoundStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-yellow-100 text-yellow-800',
      HEALING: 'bg-blue-100 text-blue-800',
      HEALED: 'bg-green-100 text-green-800',
      INFECTED: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
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

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Paciente não encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                O paciente solicitado não foi encontrado.
              </p>
              <Link href="/dashboard/patients">
                <Button>Voltar para Pacientes</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
              <div className="flex items-center space-x-3 mt-2">
                <Badge variant={patient.isActive ? "default" : "secondary"}>
                  {patient.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
                <span className="text-gray-600">
                  CPF: {formatCPF(patient.cpf)}
                </span>
                <span className="text-gray-600">
                  {getAge(patient.birthDate)} anos
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/patients">
              <Button variant="outline">
                ← Voltar para Pacientes
              </Button>
            </Link>
            <Link href={`/dashboard/patients/${patient.id}/edit`}>
              <Button variant="outline">
                Editar Dados
              </Button>
            </Link>
            <Link href={`/dashboard/wounds/new?patientId=${patient.id}`}>
              <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                + Nova Ferida
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações Pessoais */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nome Completo</p>
                    <p className="text-gray-900">{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">CPF</p>
                    <p className="text-gray-900">{formatCPF(patient.cpf)}</p>
                  </div>
                  {patient.rg && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">RG</p>
                      <p className="text-gray-900">{patient.rg}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                    <p className="text-gray-900">{formatDate(patient.birthDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gênero</p>
                    <p className="text-gray-900">{getGenderLabel(patient.gender)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Idade</p>
                    <p className="text-gray-900">{getAge(patient.birthDate)} anos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Telefone</p>
                      <p className="text-gray-900">{formatPhone(patient.phone)}</p>
                    </div>
                  )}
                  {patient.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{patient.email}</p>
                    </div>
                  )}
                </div>
                
                {(patient.address || patient.city || patient.state || patient.zipCode) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Endereço</p>
                      <div className="space-y-1">
                        {patient.address && <p className="text-gray-900">{patient.address}</p>}
                        {(patient.city || patient.state || patient.zipCode) && (
                          <p className="text-gray-900">
                            {[patient.city, patient.state, patient.zipCode && formatZipCode(patient.zipCode)]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {(patient.emergencyContact || patient.emergencyPhone) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Contato de Emergência</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {patient.emergencyContact && (
                          <div>
                            <p className="text-xs text-gray-500">Nome</p>
                            <p className="text-gray-900">{patient.emergencyContact}</p>
                          </div>
                        )}
                        {patient.emergencyPhone && (
                          <div>
                            <p className="text-xs text-gray-500">Telefone</p>
                            <p className="text-gray-900">{formatPhone(patient.emergencyPhone)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Informações Médicas */}
            {(patient.allergies || patient.comorbidities || patient.medications || patient.observations) && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações Médicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.allergies && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Alergias</p>
                      <p className="text-gray-900">{patient.allergies}</p>
                    </div>
                  )}
                  {patient.comorbidities && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Comorbidades</p>
                      <p className="text-gray-900">{patient.comorbidities}</p>
                    </div>
                  )}
                  {patient.medications && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Medicações em Uso</p>
                      <p className="text-gray-900">{patient.medications}</p>
                    </div>
                  )}
                  {patient.observations && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Observações</p>
                      <p className="text-gray-900">{patient.observations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total de Feridas</span>
                  <span className="font-semibold">{patient._count.wounds}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Feridas Ativas</span>
                  <span className="font-semibold">
                    {patient.wounds.filter(w => w.status === 'ACTIVE').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cadastrado em</span>
                  <span className="text-sm">{formatDate(patient.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cadastrado por</span>
                  <span className="text-sm">{patient.createdBy.name}</span>
                </div>
              </CardContent>
            </Card>

            {/* Feridas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Feridas
                  <Link href={`/dashboard/wounds/new?patientId=${patient.id}`}>
                    <Button size="sm" variant="outline">
                      + Nova
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.wounds.length > 0 ? (
                  <div className="space-y-3">
                    {patient.wounds.map((wound) => (
                      <div key={wound.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{wound.location}</h4>
                          <Badge className={getWoundStatusColor(wound.status)}>
                            {getWoundStatusLabel(wound.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{wound.type}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatDate(wound.createdAt)}</span>
                          <Link href={`/dashboard/wounds/${wound.id}`}>
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                              Ver detalhes
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-600 mb-3">
                      Nenhuma ferida cadastrada
                    </p>
                    <Link href={`/dashboard/wounds/new?patientId=${patient.id}`}>
                      <Button size="sm" className="bg-gradient-to-r from-teal-500 to-blue-600">
                        + Cadastrar Primeira Ferida
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}