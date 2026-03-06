import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CustomersClient from './CustomersClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CustomersPage() {
  console.log('[CustomersPage] Fetching customers at', new Date().toISOString())
  const session = await auth()
  if (!session) redirect('/login')
  const tenantId = (session.user as any).tenantId

  const customers = await prisma.customer.findMany({
    where: { tenantId },
    include: {
      _count: { select: { jobs: true, invoices: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  console.log('[CustomersPage] Found', customers.length, 'customers')

  const serializedCustomers = customers.map(c => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
    city: c.city,
    state: c.state,
    status: c.status,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    _count: {
      jobs: c._count.jobs,
      invoices: c._count.invoices,
    },
  }))

  return <CustomersClient initialCustomers={serializedCustomers} />
}
