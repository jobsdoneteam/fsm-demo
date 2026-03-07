import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      job: {
        include: {
          serviceType: true,
          assignedTo: true,
        },
      },
      lineItems: {
        orderBy: { sortOrder: 'asc' },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
      },
    },
  })

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  return NextResponse.json({
    ...invoice,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate?.toISOString() ?? null,
    paidDate: invoice.paidDate?.toISOString() ?? null,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    payments: invoice.payments.map(p => ({
      ...p,
      paidAt: p.paidAt.toISOString(),
    })),
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { lineItems, taxRate, notes, terms, dueDate, status } = body

  const updateData: any = {}

  if (lineItems) {
    await prisma.invoiceLineItem.deleteMany({
      where: { invoiceId: params.id },
    })

    const subtotal = lineItems.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0
    )

    const taxableSubtotal = lineItems
      .filter((item: any) => item.taxable)
      .reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)

    const taxAmount = taxableSubtotal * (taxRate || 0)
    const total = subtotal + taxAmount

    updateData.subtotal = subtotal
    updateData.taxRate = taxRate || 0
    updateData.taxAmount = taxAmount
    updateData.total = total
    updateData.balance = total

    updateData.lineItems = {
      create: lineItems.map((item: any, index: number) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
        taxable: item.taxable ?? true,
        sortOrder: index,
      })),
    }
  }

  if (taxRate !== undefined && !lineItems) {
    updateData.taxRate = taxRate
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { lineItems: true },
    })
    if (invoice) {
      const taxableSubtotal = invoice.lineItems
        .filter(item => item.taxable)
        .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      updateData.taxAmount = taxableSubtotal * taxRate
      updateData.total = invoice.subtotal + updateData.taxAmount
      updateData.balance = updateData.total - invoice.amountPaid
    }
  }

  if (notes !== undefined) updateData.notes = notes
  if (terms !== undefined) updateData.terms = terms
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
  if (status !== undefined) updateData.status = status

  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: updateData,
    include: {
      customer: true,
      job: true,
      lineItems: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  return NextResponse.json({
    ...invoice,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate?.toISOString() ?? null,
    paidDate: invoice.paidDate?.toISOString() ?? null,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
  })
}
