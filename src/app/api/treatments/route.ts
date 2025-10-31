import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService, PERMISSIONS, hasPermission } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

// Schema de validação para criação de tratamento
const createTreatmentSchema = z.object({
  woundId: z.string().uuid('ID da ferida deve ser um UUID válido'),
  type: z.enum(['DRESSING', 'MEDICATION', 'DEBRIDEMENT', 'THERAPY', 'OTHER']),
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
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role') as UserRole
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Verificar permissão
    if (!hasPermission(userRole, PERMISSIONS.TREATMENT_READ)) {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
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
          user: {
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

    // Calcular estatísticas simples
    const statistics = {
      total,
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
        { message: 'Parâmetros inválidos', errors: error.issues },
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
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role') as UserRole
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Verificar permissão
    if (!hasPermission(userRole, PERMISSIONS.TREATMENT_CREATE)) {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
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

    // Criar tratamento
    const treatment = await prisma.treatment.create({
      data: {
        woundId: data.woundId,
        protocol: data.description,
        dressing: data.type,
        frequency: data.frequency || '',
        technique: data.instructions || '',
        materials: data.products?.join(', ') || null,
        observations: data.observations || null,
        nextChangeDate: data.nextScheduled ? new Date(data.nextScheduled) : null,
        userId: userId,
        patientId: wound.patientId,
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
        user: {
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
        { message: 'Dados inválidos', errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}