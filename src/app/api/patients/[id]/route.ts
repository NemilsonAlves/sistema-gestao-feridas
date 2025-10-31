import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const updatePatientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos').optional(),
  rg: z.string().optional(),
  birthDate: z.string().transform((str) => new Date(str)).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  allergies: z.string().optional(),
  comorbidities: z.string().optional(),
  medications: z.string().optional(),
  observations: z.string().optional(),
})

// GET /api/patients/[id] - Buscar paciente por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const patientId = params.id
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        wounds: {
          include: {
            treatments: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            wounds: true,
          },
        },
      },
    })

    if (!patient) {
      return NextResponse.json(
        { message: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Erro ao buscar paciente:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/patients/[id] - Atualizar paciente
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const patientId = params.id
    const body = await request.json()
    
    // Validar dados
    const validatedData = updatePatientSchema.parse(body)
    
    // Verificar se o paciente existe
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    if (!existingPatient) {
      return NextResponse.json(
        { message: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Se CPF foi alterado, verificar se não existe outro paciente com o mesmo CPF
    if (validatedData.cpf && validatedData.cpf !== existingPatient.cpf) {
      const cpfExists = await prisma.patient.findUnique({
        where: { cpf: validatedData.cpf },
      })

      if (cpfExists) {
        return NextResponse.json(
          { message: 'Já existe um paciente com este CPF' },
          { status: 400 }
        )
      }
    }

    const patient = await prisma.patient.update({
        where: { id: patientId },
       data: {
         ...validatedData,
         updatedAt: new Date(),
       },
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(patient)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar paciente:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/patients/[id] - Desativar paciente (soft delete)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const patientId = params.id
    
    // Verificar se o paciente existe
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Soft delete - apenas desativar o paciente
      const patient = await prisma.patient.update({
        where: { id: patientId },
       data: {
         status: 'ALTA',
         updatedAt: new Date(),
       },
     })

    return NextResponse.json({
      message: 'Paciente desativado com sucesso',
      patient,
    })
  } catch (error) {
    console.error('Erro ao desativar paciente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}