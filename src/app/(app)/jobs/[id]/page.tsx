import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import JobDetailClient from './JobDetailClient'

export const dynamic = 'force-dynamic'

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')
  const tenantId = (session.user as any).tenantId

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      assignedTo: true,
      serviceType: true,
      createdBy: true,
      lineItems: true,
      timeEntries: {
        include: { user: true },
        orderBy: { clockIn: 'desc' },
      },
      invoices: true,
    },
  })

  if (!job) {
    redirect('/jobs')
  }

  const employees = await prisma.user.findMany({
    where: { tenantId, isActive: true },
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' },
  })

  const serviceTypes = await prisma.serviceType.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  })

  const serializedJob = {
    id: job.id,
    jobNumber: job.jobNumber,
    title: job.title,
    description: job.description,
    status: job.status,
    priority: job.priority,
    scheduledStart: job.scheduledStart?.toISOString() ?? null,
    scheduledEnd: job.scheduledEnd?.toISOString() ?? null,
    startedAt: job.startedAt?.toISOString() ?? null,
    completedAt: job.completedAt?.toISOString() ?? null,
    address: job.address,
    city: job.city,
    state: job.state,
    zip: job.zip,
    internalNotes: job.internalNotes,
    techNotes: job.techNotes,
    tags: job.tags,
    customer: {
      id: job.customer.id,
      firstName: job.customer.firstName,
      lastName: job.customer.lastName,
      email: job.customer.email,
      phone: job.customer.phone,
      address: job.customer.address,
      city: job.customer.city,
      state: job.customer.state,
      zip: job.customer.zip,
    },
    assignedTo: job.assignedTo ? { id: job.assignedTo.id, name: job.assignedTo.name } : null,
    serviceType: job.serviceType ? { id: job.serviceType.id, name: job.serviceType.name } : null,
    createdBy: job.createdBy ? { name: job.createdBy.name } : null,
    createdAt: job.createdAt.toISOString(),
    lineItems: job.lineItems.map(li => ({
      id: li.id,
      description: li.description,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      taxable: li.taxable,
    })),
    timeEntries: job.timeEntries.map(te => ({
      id: te.id,
      clockIn: te.clockIn.toISOString(),
      clockOut: te.clockOut?.toISOString() ?? null,
      breakMins: te.breakMins,
      hours: te.hours,
      notes: te.notes,
      status: te.status,
      user: te.user ? { name: te.user.name } : null,
    })),
    invoices: job.invoices.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      status: inv.status,
      total: inv.total,
      balance: inv.balance,
      issueDate: inv.issueDate.toISOString(),
    })),
  }

  const serializedEmployees = employees.map(emp => ({
    id: emp.id,
    name: emp.name,
    role: emp.role,
  }))

  const serializedServiceTypes = serviceTypes.map(st => ({
    id: st.id,
    name: st.name,
  }))

  return (
    <JobDetailClient
      initialJob={serializedJob}
      employees={serializedEmployees}
      serviceTypes={serializedServiceTypes}
    />
  )
}
