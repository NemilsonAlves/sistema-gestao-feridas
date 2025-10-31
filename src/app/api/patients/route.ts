import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const createPatientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos'),
  rg: z.string().optional(),
  birthDate: z.string().transform((str) => new Date(str)),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
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

// GET /api/patients - Listar pacientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { cpf: { contains: search } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          wounds: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      }),
      prisma.patient.count({ where }),
    ])

    return NextResponse.json({
      patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/patients - Criar novo paciente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPatientSchema.parse(body)

    // Verificar se CPF já existe
    const existingPatient = await prisma.patient.findUnique({
      where: { cpf: validatedData.cpf },
    })

    if (existingPatient) {
      return NextResponse.json(
        { message: 'Já existe um paciente com este CPF' },
        { status: 400 }
      )
    }

    // Obter ID do usuário do header (definido pelo middleware)
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { message: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const patient = await prisma.patient.create({
      data: {
        ...validatedData,
        responsibleId: userId,
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

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao criar paciente:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}