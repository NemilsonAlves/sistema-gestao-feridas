import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const updateSchema = z.object({
  description: z.string().optional(),
  annotations: z.any().optional()
})

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const params = await context.params
    const imageId = params.id

    if (!imageId) {
      return NextResponse.json({ message: 'ID da imagem é obrigatório' }, { status: 400 })
    }

    // Buscar imagem
    const image = await prisma.woundImage.findFirst({
      where: {
        id: imageId,
        wound: {
          patient: {
            responsibleId: userId
          }
        }
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
        }
      }
    })

    if (!image) {
      return NextResponse.json({ message: 'Imagem não encontrada' }, { status: 404 })
    }

    return NextResponse.json(image)
  } catch (error) {
    console.error('Erro ao buscar imagem:', error)
    return NextResponse.json({ 
      message: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const params = await context.params
    const imageId = params.id

    if (!imageId) {
      return NextResponse.json({ message: 'ID da imagem é obrigatório' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateSchema.parse(body)

    // Verificar se a imagem existe e se o usuário tem acesso
    const existingImage = await prisma.woundImage.findFirst({
      where: {
        id: imageId,
        wound: {
          patient: {
            responsibleId: userId
          }
        }
      }
    })

    if (!existingImage) {
      return NextResponse.json({ message: 'Imagem não encontrada' }, { status: 404 })
    }

    // Atualizar imagem
    const updatedImage = await prisma.woundImage.update({
      where: { id: imageId },
      data: {
        description: validatedData.description,
        annotations: validatedData.annotations
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
        }
      }
    })

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error('Erro ao atualizar imagem:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        message: 'Dados inválidos',
        errors: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const params = await context.params
    const imageId = params.id

    if (!imageId) {
      return NextResponse.json({ message: 'ID da imagem é obrigatório' }, { status: 400 })
    }

    // Verificar se a imagem existe e se o usuário tem acesso
    const existingImage = await prisma.woundImage.findFirst({
      where: {
        id: imageId,
        wound: {
          patient: {
            responsibleId: userId
          }
        }
      }
    })

    if (!existingImage) {
      return NextResponse.json({ message: 'Imagem não encontrada' }, { status: 404 })
    }

    // Excluir arquivo físico
    try {
      const filePath = join(process.cwd(), 'public', existingImage.url)
      if (existsSync(filePath)) {
        await unlink(filePath)
      }
    } catch (fileError) {
      console.error('Erro ao excluir arquivo físico:', fileError)
      // Continua com a exclusão do banco mesmo se não conseguir excluir o arquivo
    }

    // Excluir do banco de dados
    await prisma.woundImage.delete({
      where: { id: imageId }
    })

    return NextResponse.json({ message: 'Imagem excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir imagem:', error)
    return NextResponse.json({ 
      message: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}