import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Schema de validação para atualização de ferida
const updateWoundSchema = z.object({
  location: z.string().min(1, 'Localização da ferida é obrigatória').optional(),
  type: z.enum(['ULCERA_PRESSAO', 'ULCERA_DIABETICA', 'FERIDA_CIRURGICA', 'QUEIMADURA', 'LESAO_FRICCAO', 'OUTRAS']).optional(),
  stage: z.enum(['ESTAGIO_I', 'ESTAGIO_II', 'ESTAGIO_III', 'ESTAGIO_IV']).optional(),
  status: z.enum(['CICATRIZANDO', 'ESTAVEL', 'DETERIORANDO', 'INFECTADA']).optional(),
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

// GET - Buscar ferida específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const wound = await prisma.wound.findUnique({
      where: { id: resolvedParams.id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true,
          }
        },
        treatments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              }
            }
          }
        },
        images: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            treatments: true,
            images: true,
          }
        }
      }
    })

    if (!wound) {
      return NextResponse.json(
        { message: 'Ferida não encontrada' },
        { status: 404 }
      )
    }

    // Separar imagens recentes para o preview
    const recentImages = wound.images.slice(0, 4)
    
    const response = {
      ...wound,
      recentImages
    }

    return NextResponse.json({ wound: response })

  } catch (error) {
    console.error('Erro ao buscar ferida:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar ferida
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    
    // Validar dados
    const validatedData = updateWoundSchema.parse(body)
    
    // Verificar se a ferida existe
    const existingWound = await prisma.wound.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingWound) {
       return NextResponse.json(
         { message: 'Ferida não encontrada' },
         { status: 404 }
       )
     }

     // Calcular área se não fornecida mas temos comprimento e largura
     let calculatedArea = validatedData.area
     if (!calculatedArea && validatedData.length && validatedData.width) {
       calculatedArea = validatedData.length * validatedData.width
     }

     // Atualizar ferida
     const wound = await prisma.wound.update({
       where: { id: resolvedParams.id },
       data: {
         ...validatedData,
         area: calculatedArea,
         updatedAt: new Date(),
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

    return NextResponse.json(wound)

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

    console.error('Erro ao atualizar ferida:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir ferida (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    
    // Verificar se a ferida existe
    const existingWound = await prisma.wound.findUnique({
      where: { id: resolvedParams.id },
      include: {
        treatments: true,
        images: true
      }
    })

    if (!existingWound) {
       return NextResponse.json(
         { message: 'Ferida não encontrada' },
         { status: 404 }
       )
     }

     // Verificar se há tratamentos ou imagens associadas
     if (existingWound.treatments.length > 0 || existingWound.images.length > 0) {
       return NextResponse.json(
         { 
           message: 'Não é possível excluir ferida com tratamentos ou imagens associadas',
           details: {
             treatments: existingWound.treatments.length,
             images: existingWound.images.length
           }
         },
         { status: 400 }
       )
     }

     // Excluir ferida (hard delete se não há dependências)
     await prisma.wound.delete({
       where: { id: resolvedParams.id }
     })

     return NextResponse.json(
       { message: 'Ferida excluída com sucesso' },
       { status: 200 }
     )

  } catch (error) {
    console.error('Erro ao excluir ferida:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}