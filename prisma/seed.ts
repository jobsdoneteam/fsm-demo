import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('demo1234', 10)

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'fieldflow-demo' },
    update: {},
    create: {
      name: 'FieldFlow Demo',
      slug: 'fieldflow-demo',
      email: 'info@fieldflowdemo.com',
      phone: '(555) 123-4567',
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
    },
  })

  const apexTenant = await prisma.tenant.upsert({
    where: { slug: 'apex-plumbing' },
    update: {},
    create: {
      name: 'Apex Plumbing',
      slug: 'apex-plumbing',
      email: 'info@apexplumbing.com',
      phone: '(412) 555-0198',
      address: '789 Industry Blvd',
      city: 'Pittsburgh',
      state: 'PA',
      zip: '15201',
    },
  })

  const owner = await prisma.user.upsert({
    where: { email: 'owner@fieldflowdemo.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Demo Owner',
      email: 'owner@fieldflowdemo.com',
      password: hashedPassword,
      role: 'OWNER',
      phone: '(555) 111-2222',
      title: 'Owner',
      hourlyRate: 75.0,
      hireDate: new Date('2020-01-01'),
      isActive: true,
    },
  })

  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatch@fieldflowdemo.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Demo Dispatcher',
      email: 'dispatch@fieldflowdemo.com',
      password: hashedPassword,
      role: 'DISPATCHER',
      phone: '(555) 222-3333',
      title: 'Dispatcher',
      hourlyRate: 45.0,
      hireDate: new Date('2021-03-15'),
      isActive: true,
    },
  })

  const tech1 = await prisma.user.upsert({
    where: { email: 'tech1@fieldflowdemo.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Tech One',
      email: 'tech1@fieldflowdemo.com',
      password: hashedPassword,
      role: 'TECH',
      phone: '(555) 333-4444',
      title: 'Field Technician',
      hourlyRate: 55.0,
      hireDate: new Date('2022-06-01'),
      certifications: ['HVAC Level 2', 'Electrical Safety'],
      isActive: true,
    },
  })

  const customer1 = await prisma.customer.findFirst({
    where: { email: 'john.doe@example.com' }
  }) || await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 444-5555',
      address: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      tags: ['residential', 'priority'],
      isActive: true,
    },
  })

  const customer2 = await prisma.customer.findFirst({
    where: { email: 'jane.smith@business.com' }
  }) || await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@business.com',
      phone: '(555) 555-6666',
      address: '789 Pine St',
      city: 'Oakland',
      state: 'CA',
      zip: '94601',
      tags: ['commercial', 'contract'],
      isActive: true,
    },
  })

  const hvacService = await prisma.serviceType.upsert({
    where: { id: 'hvac-service' },
    update: {},
    create: {
      id: 'hvac-service',
      tenantId: tenant.id,
      name: 'HVAC Repair',
      description: 'Heating and cooling system repairs',
      defaultRate: 120.0,
      duration: 120,
      color: '#3b82f6',
    },
  })

  const plumbingService = await prisma.serviceType.upsert({
    where: { id: 'plumbing-service' },
    update: {},
    create: {
      id: 'plumbing-service',
      tenantId: tenant.id,
      name: 'Plumbing',
      description: 'Plumbing repairs and installations',
      defaultRate: 95.0,
      duration: 90,
      color: '#10b981',
    },
  })

  const job1 = await prisma.job.upsert({
    where: { jobNumber: 'JOB-001' },
    update: {},
    create: {
      jobNumber: 'JOB-001',
      tenantId: tenant.id,
      customerId: customer1.id,
      serviceTypeId: hvacService.id,
      assignedToId: tech1.id,
      createdById: dispatcher.id,
      title: 'AC Unit Not Cooling',
      description: 'Customer reports AC unit is blowing warm air',
      status: 'SCHEDULED',
      priority: 'HIGH',
      scheduledStart: new Date('2025-03-07T09:00:00'),
      scheduledEnd: new Date('2025-03-07T11:00:00'),
      address: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      laborRate: 120.0,
    },
  })

  const job2 = await prisma.job.upsert({
    where: { jobNumber: 'JOB-002' },
    update: {},
    create: {
      jobNumber: 'JOB-002',
      tenantId: tenant.id,
      customerId: customer2.id,
      serviceTypeId: plumbingService.id,
      assignedToId: tech1.id,
      createdById: dispatcher.id,
      title: 'Leaky Faucet Repair',
      description: 'Kitchen faucet dripping constantly',
      status: 'NEW',
      priority: 'NORMAL',
      address: '789 Pine St',
      city: 'Oakland',
      state: 'CA',
      zip: '94601',
      laborRate: 95.0,
    },
  })

  await prisma.jobLineItem.upsert({
    where: { id: 'line-item-1' },
    update: {},
    create: {
      id: 'line-item-1',
      jobId: job1.id,
      description: 'AC Compressor Diagnostic',
      quantity: 1,
      unitPrice: 85.0,
      taxable: true,
      sortOrder: 0,
    },
  })

  const inventoryItem1 = await prisma.inventoryItem.upsert({
    where: { id: 'inv-1' },
    update: {},
    create: {
      id: 'inv-1',
      tenantId: tenant.id,
      sku: 'AC-FILT-001',
      name: 'AC Air Filter',
      description: '20x20x1 pleated air filter',
      category: 'PARTS',
      unit: 'each',
      costPrice: 12.0,
      sellPrice: 25.0,
      quantityOnHand: 45,
      reorderPoint: 10,
      reorderQty: 20,
      supplier: 'HVAC Supplies Co.',
      isActive: true,
    },
  })

  const inventoryItem2 = await prisma.inventoryItem.upsert({
    where: { id: 'inv-2' },
    update: {},
    create: {
      id: 'inv-2',
      tenantId: tenant.id,
      sku: 'PLG-FIX-001',
      name: 'Plumbing Repair Kit',
      description: 'Basic plumbing repair supplies',
      category: 'SUPPLIES',
      unit: 'kit',
      costPrice: 35.0,
      sellPrice: 75.0,
      quantityOnHand: 12,
      reorderPoint: 5,
      reorderQty: 10,
      supplier: 'Plumbers Depot',
      isActive: true,
    },
  })

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  await prisma.schedule.upsert({
    where: { id: 'schedule-1' },
    update: {},
    create: {
      id: 'schedule-1',
      tenantId: tenant.id,
      userId: tech1.id,
      date: tomorrow,
      startTime: new Date(tomorrow.setHours(8, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(17, 0, 0, 0)),
      notes: 'Regular shift - available for dispatch',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Demo Accounts:')
  console.log('  Owner/Admin:   owner@fieldflowdemo.com / demo1234')
  console.log('  Dispatcher:    dispatch@fieldflowdemo.com / demo1234')
  console.log('  Field Tech:    tech1@fieldflowdemo.com / demo1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
