import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService, PERMISSIONS, hasPermission } from '@/lib/auth'
import { UserRole } from '@prisma/client'
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
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params
    const treatmentId = resolvedParams.id

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
        user: {
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
  { params }: { params: Promise<{ id: string }> }
) {
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
    if (!hasPermission(userRole, PERMISSIONS.TREATMENT_UPDATE)) {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const treatmentId = resolvedParams.id

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

    if (data.type !== undefined) updateData.dressing = data.type
    if (data.description !== undefined) updateData.protocol = data.description
    if (data.products !== undefined) updateData.materials = data.products.join(', ')
    if (data.frequency !== undefined) updateData.frequency = data.frequency
    if (data.instructions !== undefined) updateData.technique = data.instructions
    if (data.observations !== undefined) updateData.observations = data.observations

    // Tratar datas
    if (data.nextScheduled !== undefined) {
      updateData.nextChangeDate = data.nextScheduled ? new Date(data.nextScheduled) : null
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
        user: {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    if (!hasPermission(userRole, PERMISSIONS.TREATMENT_DELETE)) {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const treatmentId = resolvedParams.id

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