import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const uploadSchema = z.object({
  woundId: z.string().uuid(),
  description: z.string().optional(),
  capturedAt: z.string().optional(),
  isBeforeAfter: z.boolean().optional().default(false),
  beforeAfterType: z.enum(['BEFORE', 'AFTER']).optional()
})

const querySchema = z.object({
  woundId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  isBeforeAfter: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const user = AuthService.verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const woundId = formData.get('woundId') as string
    const description = formData.get('description') as string
    const capturedAt = formData.get('capturedAt') as string
    const isBeforeAfter = formData.get('isBeforeAfter') === 'true'
    const beforeAfterType = formData.get('beforeAfterType') as string

    if (!file) {
      return NextResponse.json({ message: 'Arquivo é obrigatório' }, { status: 400 })
    }

    // Validar dados
    const validatedData = uploadSchema.parse({
      woundId,
      description: description || undefined,
      capturedAt: capturedAt || undefined,
      isBeforeAfter,
      beforeAfterType: beforeAfterType || undefined
    })

    // Verificar se a ferida existe e se o usuário tem acesso
    const wound = await prisma.wound.findFirst({
      where: {
        id: validatedData.woundId,
        patient: {
          createdById: session.user.id
        }
      },
      include: {
        patient: true
      }
    })

    if (!wound) {
      return NextResponse.json({ message: 'Ferida não encontrada' }, { status: 404 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        message: 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP' 
      }, { status: 400 })
    }

    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        message: 'Arquivo muito grande. Máximo 10MB' 
      }, { status: 400 })
    }

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'wounds')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${validatedData.woundId}_${timestamp}.${extension}`
    const filePath = join(uploadDir, fileName)
    const publicPath = `/uploads/wounds/${fileName}`

    // Salvar arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Salvar no banco de dados
    const image = await prisma.woundImage.create({
      data: {
        woundId: validatedData.woundId,
        fileName,
        filePath: publicPath,
        fileSize: file.size,
        mimeType: file.type,
        description: validatedData.description,
        capturedAt: validatedData.capturedAt ? new Date(validatedData.capturedAt) : new Date(),
        isBeforeAfter: validatedData.isBeforeAfter,
        beforeAfterType: validatedData.beforeAfterType,
        uploadedById: session.user.id
      },
      include: {
        wound: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                cpf: true
              }
            }
          }
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Erro no upload de imagem:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        message: 'Dados inválidos',
        errors: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = AuthService.verifyToken(request)
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      woundId: searchParams.get('woundId') || undefined,
      patientId: searchParams.get('patientId') || undefined,
      isBeforeAfter: searchParams.get('isBeforeAfter') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20'
    })

    const page = parseInt(query.page!)
    const limit = parseInt(query.limit!)
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      wound: {
        patient: {
          createdById: session.user.id
        }
      }
    }

    if (query.woundId) {
      where.woundId = query.woundId
    }

    if (query.patientId) {
      where.wound.patient.id = query.patientId
    }

    if (query.isBeforeAfter) {
      where.isBeforeAfter = query.isBeforeAfter === 'true'
    }

    // Buscar imagens
    const [images, total] = await Promise.all([
      prisma.woundImage.findMany({
        where,
        include: {
          wound: {
            include: {
              patient: {
                select: {
                  id: true,
                  name: true,
                  cpf: true
                }
              }
            }
          },
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          capturedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.woundImage.count({ where })
    ])

    // Calcular estatísticas
    const statistics = await prisma.woundImage.groupBy({
      by: ['isBeforeAfter'],
      where: {
        wound: {
          patient: {
            createdById: session.user.id
          }
        }
      },
      _count: {
        id: true
      }
    })

    const stats = {
      total,
      beforeAfter: statistics.find(s => s.isBeforeAfter)?._count.id || 0,
      regular: statistics.find(s => !s.isBeforeAfter)?._count.id || 0
    }

    return NextResponse.json({
      images,
      statistics: stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar imagens:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        message: 'Parâmetros inválidos',
        errors: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}