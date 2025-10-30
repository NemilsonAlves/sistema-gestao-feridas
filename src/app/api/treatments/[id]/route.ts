import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para atualização de tratamento
const updateTreatmentSchema = z.object({
  type: z.enum(['DRESSING', 'MEDICATION', 'DEBRIDEMENT', 'THERAPY', 'OTHER']).optional(),
  description: z.string().min(1, 'Descrição é obrigatória').optional(),
  products: z.array(z.string()).optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  nextScheduled: z.string().datetime().optional(),
  performedBy: z.string().optional(),
  observations: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'OVERDUE']).optional(),
  completedAt: z.string().datetime().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const user = await AuthService.verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    const treatmentId = params.id

    // Validar UUID
    if (!z.string().uuid().safeParse(treatmentId).success) {
      return NextResponse.json(
        { message: 'ID do tratamento inválido' },
        { status: 400 }
      )
    }

    // Buscar tratamento
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
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

    if (!treatment) {
      return NextResponse.json(
        { message: 'Tratamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(treatment)

  } catch (error) {
    console.error('Erro ao buscar tratamento:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const user = await AuthService.verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    const treatmentId = params.id

    // Validar UUID
    if (!z.string().uuid().safeParse(treatmentId).success) {
      return NextResponse.json(
        { message: 'ID do tratamento inválido' },
        { status: 400 }
      )
    }

    // Verificar se o tratamento existe
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id: treatmentId }
    })

    if (!existingTreatment) {
      return NextResponse.json(
        { message: 'Tratamento não encontrado' },
        { status: 404 }
      )
    }

    // Validar dados do corpo da requisição
    const body = await request.json()
    const data = updateTreatmentSchema.parse(body)

    // Preparar dados para atualização
    const updateData: any = {}

    if (data.type !== undefined) updateData.type = data.type
    if (data.description !== undefined) updateData.description = data.description
    if (data.products !== undefined) updateData.products = data.products
    if (data.frequency !== undefined) updateData.frequency = data.frequency
    if (data.duration !== undefined) updateData.duration = data.duration
    if (data.instructions !== undefined) updateData.instructions = data.instructions
    if (data.performedBy !== undefined) updateData.performedBy = data.performedBy
    if (data.observations !== undefined) updateData.observations = data.observations
    if (data.status !== undefined) updateData.status = data.status

    // Tratar datas
    if (data.nextScheduled !== undefined) {
      updateData.nextScheduled = data.nextScheduled ? new Date(data.nextScheduled) : null
    }

    if (data.completedAt !== undefined) {
      updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null
    }

    // Se o status está sendo alterado para COMPLETED, definir completedAt se não fornecido
    if (data.status === 'COMPLETED' && !data.completedAt) {
      updateData.completedAt = new Date()
    }

    // Se o status não é mais COMPLETED, remover completedAt
    if (data.status && data.status !== 'COMPLETED') {
      updateData.completedAt = null
    }

    // Atualizar tratamento
    const treatment = await prisma.treatment.update({
      where: { id: treatmentId },
      data: updateData,
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

    return NextResponse.json(treatment)

  } catch (error) {
    console.error('Erro ao atualizar tratamento:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const user = await AuthService.verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    const treatmentId = params.id

    // Validar UUID
    if (!z.string().uuid().safeParse(treatmentId).success) {
      return NextResponse.json(
        { message: 'ID do tratamento inválido' },
        { status: 400 }
      )
    }

    // Verificar se o tratamento existe
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id: treatmentId }
    })

    if (!existingTreatment) {
      return NextResponse.json(
        { message: 'Tratamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o tratamento pode ser excluído
    // Tratamentos concluídos podem ter restrições de exclusão dependendo das regras de negócio
    if (existingTreatment.status === 'COMPLETED') {
      // Por enquanto, permitir exclusão, mas em produção pode ser necessário soft delete
      // ou restrições adicionais
    }

    // Excluir tratamento
    await prisma.treatment.delete({
      where: { id: treatmentId }
    })

    return NextResponse.json(
      { message: 'Tratamento excluído com sucesso' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao excluir tratamento:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}