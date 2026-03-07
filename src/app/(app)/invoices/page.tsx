import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import InvoicesClient from './InvoicesClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function InvoicesPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const tenantId = (session.user as any).tenantId

  const [invoices, customers] = await Promise.all([
    prisma.invoice.findMany({
      where: { tenantId },
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
    }),
    prisma.customer.findMany({
      where: { tenantId },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      orderBy: { firstName: 'asc' },
    }),
  ])

  const serializedInvoices = invoices.map(inv => ({
    ...inv,
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate?.toISOString() ?? null,
    paidDate: inv.paidDate?.toISOString() ?? null,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
  }))

  const statusCounts = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <InvoicesClient
      initialInvoices={serializedInvoices}
      initialStatusCounts={statusCounts}
      customers={customers}
    />
  )
}
