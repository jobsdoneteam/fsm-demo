import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenantId = (session.user as any).tenantId
  const body = await request.json()
  const { jobId } = body

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      customer: true,
      lineItems: true,
      timeEntries: true,
      tenant: true,
    },
  })

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  })

  const laborRate = job.laborRate || 85
  const totalHours = job.timeEntries.reduce((sum, te) => sum + (te.hours || 0), 0)
  const laborTotal = totalHours * laborRate

  const lineItems: any[] = []

  job.lineItems.forEach(li => {
    lineItems.push({
      description: li.description,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      taxable: li.taxable,
    })
  })

  if (totalHours > 0) {
    lineItems.push({
      description: `Labor (${totalHours.toFixed(1)} hours @ $${laborRate.toFixed(2)}/hr)`,
      quantity: 1,
      unitPrice: laborTotal,
      taxable: false,
    })
  }

  const taxRate = tenant?.defaultTaxRate || 0.08

  return NextResponse.json({
    customerId: job.customer.id,
    customer: job.customer,
    jobId: job.id,
    job: {
      id: job.id,
      jobNumber: job.jobNumber,
      title: job.title,
    },
    lineItems,
    taxRate,
    subtotal: lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  })
}
