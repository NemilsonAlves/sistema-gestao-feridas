import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Schema de validação para criação de ferida
const createWoundSchema = z.object({
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  location: z.string().min(1, 'Localização da ferida é obrigatória'),
  type: z.enum(['PRESSURE_ULCER', 'DIABETIC_ULCER', 'VENOUS_ULCER', 'ARTERIAL_ULCER', 'SURGICAL', 'TRAUMATIC', 'OTHER'], {
    errorMap: () => ({ message: 'Tipo de ferida inválido' })
  }),
  stage: z.enum(['STAGE_1', 'STAGE_2', 'STAGE_3', 'STAGE_4', 'UNSTAGEABLE', 'SUSPECTED_DTI'], {
    errorMap: () => ({ message: 'Estágio da ferida inválido' })
  }).optional(),
  length: z.number().positive('Comprimento deve ser positivo').optional(),
  width: z.number().positive('Largura deve ser positiva').optional(),
  depth: z.number().positive('Profundidade deve ser positiva').optional(),
  area: z.number().positive('Área deve ser positiva').optional(),
  tissueType: z.enum(['GRANULATION', 'EPITHELIAL', 'SLOUGH', 'NECROTIC', 'MIXED'], {
    errorMap: () => ({ message: 'Tipo de tecido inválido' })
  }).optional(),
  exudate: z.enum(['NONE', 'MINIMAL', 'MODERATE', 'HEAVY'], {
    errorMap: () => ({ message: 'Quantidade de exsudato inválida' })
  }).optional(),
  exudateType: z.enum(['SEROUS', 'SANGUINEOUS', 'SEROSANGUINEOUS', 'PURULENT'], {
    errorMap: () => ({ message: 'Tipo de exsudato inválido' })
  }).optional(),
  odor: z.enum(['NONE', 'MILD', 'MODERATE', 'STRONG'], {
    errorMap: () => ({ message: 'Intensidade do odor inválida' })
  }).optional(),
  pain: z.number().min(0).max(10, 'Dor deve estar entre 0 e 10').optional(),
  edema: z.boolean().optional(),
  infection: z.boolean().optional(),
  temperature: z.enum(['NORMAL', 'WARM', 'HOT', 'COOL'], {
    errorMap: () => ({ message: 'Temperatura inválida' })
  }).optional(),
  periwoundSkin: z.enum(['INTACT', 'MACERATED', 'EXCORIATED', 'INDURATED', 'ERYTHEMATOUS'], {
    errorMap: () => ({ message: 'Condição da pele perilesional inválida' })
  }).optional(),
  description: z.string().optional(),
  riskFactors: z.string().optional(),
  previousTreatments: z.string().optional(),
})

// GET - Listar feridas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (search) {
      where.OR = [
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { patient: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (patientId) {
      where.patientId = patientId
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    // Buscar feridas
    const [wounds, total] = await Promise.all([
      prisma.wound.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              cpf: true,
              isActive: true,
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            }
          },
          _count: {
            select: {
              treatments: true,
              images: true,
            }
          }
        }
      }),
      prisma.wound.count({ where })
    ])

    // Calcular estatísticas
    const stats = await prisma.wound.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      where: patientId ? { patientId } : {}
    })

    const statistics = {
      total,
      active: stats.find(s => s.status === 'ACTIVE')?._count.id || 0,
      healing: stats.find(s => s.status === 'HEALING')?._count.id || 0,
      healed: stats.find(s => s.status === 'HEALED')?._count.id || 0,
      infected: stats.find(s => s.status === 'INFECTED')?._count.id || 0,
    }

    return NextResponse.json({
      wounds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics
    })

  } catch (error) {
    console.error('Erro ao buscar feridas:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova ferida
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados
    const validatedData = createWoundSchema.parse(body)

    // Verificar se o paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id: validatedData.patientId }
    })

    if (!patient) {
      return NextResponse.json(
        { message: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Obter ID do usuário criador (simulado - em produção viria do token JWT)
    const userId = request.headers.get('x-user-id') || 'user-1'

    // Calcular área se não fornecida mas temos comprimento e largura
    let calculatedArea = validatedData.area
    if (!calculatedArea && validatedData.length && validatedData.width) {
      calculatedArea = validatedData.length * validatedData.width
    }

    // Criar ferida
    const wound = await prisma.wound.create({
      data: {
        ...validatedData,
        area: calculatedArea,
        status: 'ACTIVE', // Status inicial sempre ativo
        createdById: userId,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      }
    })

    return NextResponse.json(wound, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Dados inválidos',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('Erro ao criar ferida:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}