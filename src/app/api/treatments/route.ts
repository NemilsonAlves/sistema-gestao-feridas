import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para criação de tratamento
const createTreatmentSchema = z.object({
  woundId: z.string().uuid('ID da ferida deve ser um UUID válido'),
  type: z.enum(['DRESSING', 'MEDICATION', 'DEBRIDEMENT', 'THERAPY', 'OTHER'], {
    errorMap: () => ({ message: 'Tipo de tratamento inválido' })
  }),
  description: z.string().min(1, 'Descrição é obrigatória'),
  products: z.array(z.string()).optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  nextScheduled: z.string().datetime().optional(),
  performedBy: z.string().optional(),
  observations: z.string().optional(),
})

// Schema de validação para busca
const searchSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  woundId: z.string().uuid().optional(),
  type: z.enum(['DRESSING', 'MEDICATION', 'DEBRIDEMENT', 'THERAPY', 'OTHER']).optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'OVERDUE']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Validar parâmetros de busca
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const {
      page,
      limit,
      search,
      woundId,
      type,
      status,
      dateFrom,
      dateTo
    } = searchSchema.parse(params)

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Construir filtros
    const where: any = {}

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { instructions: { contains: search, mode: 'insensitive' } },
        { observations: { contains: search, mode: 'insensitive' } },
        { performedBy: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (woundId) {
      where.woundId = woundId
    }

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    // Buscar tratamentos
    const [treatments, total] = await Promise.all([
      prisma.treatment.findMany({
        where,
        include: {
          wound: {
            include: {
              patient: {
                select: {
                  id: true,
                  name: true,
                  cpf: true,
                }
              }
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.treatment.count({ where })
    ])

    // Calcular estatísticas
    const stats = await prisma.treatment.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      where: woundId ? { woundId } : {}
    })

    const statistics = {
      total,
      scheduled: stats.find(s => s.status === 'SCHEDULED')?._count.id || 0,
      completed: stats.find(s => s.status === 'COMPLETED')?._count.id || 0,
      cancelled: stats.find(s => s.status === 'CANCELLED')?._count.id || 0,
      overdue: stats.find(s => s.status === 'OVERDUE')?._count.id || 0,
    }

    return NextResponse.json({
      treatments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      statistics
    })

  } catch (error) {
    console.error('Erro ao buscar tratamentos:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Parâmetros inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Validar dados do corpo da requisição
    const body = await request.json()
    const data = createTreatmentSchema.parse(body)

    // Verificar se a ferida existe e pertence a um paciente acessível
    const wound = await prisma.wound.findUnique({
      where: { id: data.woundId },
      include: {
        patient: true
      }
    })

    if (!wound) {
      return NextResponse.json(
        { message: 'Ferida não encontrada' },
        { status: 404 }
      )
    }

    // Determinar status inicial
    let status = 'SCHEDULED'
    if (data.nextScheduled) {
      const scheduledDate = new Date(data.nextScheduled)
      const now = new Date()
      if (scheduledDate < now) {
        status = 'OVERDUE'
      }
    }

    // Criar tratamento
    const treatment = await prisma.treatment.create({
      data: {
        woundId: data.woundId,
        type: data.type,
        description: data.description,
        products: data.products || [],
        frequency: data.frequency,
        duration: data.duration,
        instructions: data.instructions,
        nextScheduled: data.nextScheduled ? new Date(data.nextScheduled) : null,
        performedBy: data.performedBy,
        observations: data.observations,
        status,
        createdById: user.id,
      },
      include: {
        wound: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                cpf: true,
              }
            }
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

    return NextResponse.json(treatment, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar tratamento:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}