import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Schema de validação para criação de ferida
const createWoundSchema = z.object({
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  location: z.string().min(1, 'Localização da ferida é obrigatória'),
  anatomicalRegion: z.string().min(1, 'Região anatômica é obrigatória'),
  type: z.enum(['ULCERA_PRESSAO', 'ULCERA_DIABETICA', 'FERIDA_CIRURGICA', 'QUEIMADURA', 'LESAO_FRICCAO', 'OUTRAS']),
  stage: z.enum(['ESTAGIO_I', 'ESTAGIO_II', 'ESTAGIO_III', 'ESTAGIO_IV']).optional(),
  length: z.number().positive('Comprimento deve ser positivo').optional(),
  width: z.number().positive('Largura deve ser positiva').optional(),
  depth: z.number().positive('Profundidade deve ser positiva').optional(),
  area: z.number().positive('Área deve ser positiva').optional(),
  tissueType: z.enum(['GRANULACAO', 'NECROSE', 'FIBRINA', 'EPITELIZACAO']).optional(),
  exudate: z.enum(['NONE', 'MINIMAL', 'MODERATE', 'HEAVY']).optional(),
  exudateType: z.enum(['SEROUS', 'SANGUINEOUS', 'SEROSANGUINEOUS', 'PURULENT']).optional(),
  odor: z.enum(['NONE', 'MILD', 'MODERATE', 'STRONG']).optional(),
  pain: z.number().min(0).max(10, 'Dor deve estar entre 0 e 10').optional(),
  edema: z.boolean().optional(),
  infection: z.boolean().optional(),
  temperature: z.enum(['NORMAL', 'WARM', 'HOT', 'COOL']).optional(),
  periwoundSkin: z.enum(['INTACT', 'MACERATED', 'EXCORIATED', 'INDURATED', 'ERYTHEMATOUS']).optional(),
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
      active: stats.find(s => s.status === 'ESTAVEL')?._count.id || 0,
      healing: stats.find(s => s.status === 'CICATRIZANDO')?._count.id || 0,
      deteriorating: stats.find(s => s.status === 'DETERIORANDO')?._count.id || 0,
      infected: stats.find(s => s.status === 'INFECTADA')?._count.id || 0,
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
        status: 'ESTAVEL', // Status inicial sempre estável
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
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
          errors: error.issues.map(err => ({
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