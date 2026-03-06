import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const tenantId = (session.user as any).tenantId
  
  const customers = await prisma.customer.findMany({
    where: { tenantId },
    include: {
      _count: { select: { jobs: true, invoices: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

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

  return NextResponse.json(serializedCustomers)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const tenantId = (session.user as any).tenantId
  const body = await request.json()
  
  const { firstName, lastName, email, phone, city, state, address } = body
  
  const customer = await prisma.customer.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      city,
      state,
      address,
      status: 'ACTIVE',
      isActive: true,
      tenant: { connect: { id: tenantId } },
    },
    include: {
      _count: { select: { jobs: true, invoices: true } },
    },
  })

  return NextResponse.json({
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    city: customer.city,
    state: customer.state,
    status: customer.status,
    isActive: customer.isActive,
    createdAt: customer.createdAt.toISOString(),
    _count: {
      jobs: customer._count.jobs,
      invoices: customer._count.invoices,
    },
  })
}
