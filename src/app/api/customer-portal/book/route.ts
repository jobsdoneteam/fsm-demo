import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { broadcastBookingEvent } from '@/lib/eventEmitter'

const DEMO_TENANT_SLUG = 'apex-plumbing'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0] || ''
  const lastName = parts.slice(1).join(' ') || ''
  return { firstName, lastName }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, serviceType, preferredDate, preferredTime, description } = body

    if (!name || !email || !serviceType) {
      return NextResponse.json({ error: 'name, email, and serviceType are required' }, { status: 400 })
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug: DEMO_TENANT_SLUG } })
    if (!tenant) {
      return NextResponse.json({ error: 'Demo tenant not found. Has the DB been seeded?' }, { status: 500 })
    }

    const { firstName, lastName } = splitName(name)

    let customer = await prisma.customer.findFirst({
      where: { tenantId: tenant.id, email },
    })

    if (customer) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { firstName, lastName, phone: phone || customer.phone },
      })
    } else {
      customer = await prisma.customer.create({
        data: { 
          tenant: { connect: { id: tenant.id } }, 
          firstName, 
          lastName, 
          email, 
          phone: phone || null, 
          status: 'INQUIRY',
          isActive: true 
        },
      })
    }

    const jobCount = await prisma.job.count({ where: { tenantId: tenant.id } })
    const jobNumber = `WEB-${String(jobCount + 1).padStart(4, '0')}`

    let scheduledStart: Date | undefined
    if (preferredDate) {
      scheduledStart = new Date(preferredDate)
      if (isNaN(scheduledStart.getTime())) scheduledStart = undefined
    }

    const job = await prisma.job.create({
      data: {
        tenant: { connect: { id: tenant.id } },
        jobNumber,
        customer: { connect: { id: customer.id } },
        title: serviceType,
        description: [
          description,
          preferredTime ? `Preferred time: ${preferredTime}` : null,
          'Booked via customer portal',
        ].filter(Boolean).join('\n'),
        status: 'NEW',
        priority: serviceType.toLowerCase().includes('emergency') ? 'URGENT' : 'NORMAL',
        scheduledStart: scheduledStart ?? null,
        tags: ['web-booking'],
      },
    })

    const notifyEmail = process.env.PLUMBER_NOTIFY_EMAIL
    if (resend && notifyEmail) {
      const formattedDate = preferredDate
        ? new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
        : 'Not specified'

      await resend.emails.send({
        from: 'FieldFlow Bookings <bookings@fieldflow.app>',
        to: notifyEmail,
        subject: `New Booking: ${serviceType} — ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
            <div style="background: #1d4ed8; padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 20px;">New Service Request</h1>
              <p style="color: #bfdbfe; margin: 4px 0 0; font-size: 14px;">via Apex Plumbing customer portal</p>
            </div>
            <div style="background: #f9fafb; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Job #</td><td style="padding: 8px 0; font-weight: 600;">${jobNumber}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;">Customer</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #1d4ed8;">${email}</a></td></tr>
                ${phone ? `<tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0;">${phone}</td></tr>` : ''}
                <tr><td style="padding: 8px 0; color: #6b7280;">Service</td><td style="padding: 8px 0; font-weight: 600; color: #1d4ed8;">${serviceType}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;">Preferred Date</td><td style="padding: 8px 0;">${formattedDate}</td></tr>
                ${preferredTime ? `<tr><td style="padding: 8px 0; color: #6b7280;">Preferred Time</td><td style="padding: 8px 0;">${preferredTime}</td></tr>` : ''}
                ${description ? `<tr><td style="padding: 8px 0; color: #6b7280; vertical-align: top;">Details</td><td style="padding: 8px 0;">${description}</td></tr>` : ''}
              </table>
              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
                Managed by <strong style="color: #6b7280;">FieldFlow</strong> — the operating system for service businesses
              </div>
            </div>
          </div>
        `,
      })
    }

    broadcastBookingEvent({
      type: 'NEW_BOOKING',
      data: {
        job: {
          id: job.id,
          jobNumber: job.jobNumber,
          title: job.title,
          status: job.status,
          priority: job.priority,
          scheduledStart: job.scheduledStart,
          createdAt: job.createdAt,
        },
        customer: {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
        },
      },
    })

    return NextResponse.json({ success: true, jobNumber: job.jobNumber, customerId: customer.id, jobId: job.id })
  } catch (err: unknown) {
    console.error('[customer-portal/book]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}