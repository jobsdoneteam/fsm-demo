import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenantId = (session.user as any).tenantId
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const jobId = searchParams.get('jobId')

  const where: any = { tenantId }
  if (status) {
    where.status = status
  }
  if (jobId) {
    where.jobId = jobId
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      job: {
        select: {
          id: true,
          jobNumber: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = invoices.map(inv => ({
    ...inv,
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate?.toISOString() ?? null,
    paidDate: inv.paidDate?.toISOString() ?? null,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
  }))

  return NextResponse.json(serialized)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenantId = (session.user as any).tenantId
  const body = await request.json()

  const {
    customerId,
    jobId,
    lineItems,
    taxRate,
    notes,
    terms,
    dueDate,
    status = 'DRAFT',
  } = body

  const lastInvoice = await prisma.invoice.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  })

  const lastNumber = lastInvoice?.invoiceNumber
    ? parseInt(lastInvoice.invoiceNumber.split('-')[1])
    : 0
  const nextNumber = String(lastNumber + 1).padStart(3, '0')
  const invoiceNumber = `INV-${nextNumber}`

  const subtotal = lineItems.reduce(
    (sum: number, item: any) => sum + item.quantity * item.unitPrice,
    0
  )

  const taxableSubtotal = lineItems
    .filter((item: any) => item.taxable)
    .reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)

  const taxAmount = taxableSubtotal * (taxRate || 0)
  const total = subtotal + taxAmount

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      tenant: { connect: { id: tenantId } },
      customer: { connect: { id: customerId } },
      job: jobId ? { connect: { id: jobId } } : undefined,
      status,
      issueDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      subtotal,
      taxRate: taxRate || 0,
      taxAmount,
      total,
      balance: total,
      notes,
      terms,
      lineItems: {
        create: lineItems.map((item: any, index: number) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          taxable: item.taxable ?? true,
          sortOrder: index,
        })),
      },
    },
    include: {
      customer: true,
      job: true,
      lineItems: true,
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
