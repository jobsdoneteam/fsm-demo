import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import JobsClient from './JobsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function JobsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const tenantId = (session.user as any).tenantId

  const [jobs, customers, serviceTypes, technicians] = await Promise.all([
    prisma.job.findMany({
      where: { tenantId },
      include: {
        customer: true,
        assignedTo: true,
        serviceType: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.findMany({
      where: { tenantId },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      orderBy: { firstName: 'asc' },
    }),
    prisma.serviceType.findMany({
      where: { tenantId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { tenantId, role: 'TECH' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const serializedJobs = jobs.map(job => ({
    ...job,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    scheduledStart: job.scheduledStart?.toISOString() ?? null,
    scheduledEnd: job.scheduledEnd?.toISOString() ?? null,
  }))

  const statusCounts = jobs.reduce((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <JobsClient
      initialJobs={serializedJobs}
      initialStatusCounts={statusCounts}
      customers={customers}
      serviceTypes={serviceTypes}
      technicians={technicians}
    />
  )
}
