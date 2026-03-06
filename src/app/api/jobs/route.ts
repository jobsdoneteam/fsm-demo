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
  
  const { title, customerId, serviceTypeId, assignedToId, priority, scheduledStart, scheduledEnd, description } = body
  
  const lastJob = await prisma.job.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  })

  const lastNumber = lastJob?.jobNumber ? parseInt(lastJob.jobNumber.split('-')[1]) : 0
  const nextNumber = String(lastNumber + 1).padStart(3, '0')
  const jobNumber = `JOB-${nextNumber}`

  const jobData: any = {
    jobNumber,
    title,
    description,
    priority: priority || 'NORMAL',
    status: 'NEW',
    scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
    scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
    tenant: { connect: { id: tenantId } },
  }

  if (customerId) {
    jobData.customer = { connect: { id: customerId } }
  }

  if (serviceTypeId) {
    jobData.serviceType = { connect: { id: serviceTypeId } }
  }

  if (assignedToId) {
    jobData.assignedTo = { connect: { id: assignedToId } }
  }

  const job = await prisma.job.create({
    data: jobData,
    include: {
      customer: true,
      assignedTo: true,
      serviceType: true,
    },
  })

  return NextResponse.json(job)
}
