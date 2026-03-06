import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const tenantId = (session.user as any).tenantId
  
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    select: { tenantId: true },
  })
  
  if (!job || job.tenantId !== tenantId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }
  
  try {
    const body = await req.json()
    const { 
      title, 
      description, 
      status, 
      priority, 
      scheduledStart, 
      scheduledEnd, 
      address, 
      city, 
      state, 
      zip, 
      internalNotes, 
      techNotes,
      assignedToId,
      serviceTypeId
    } = body
    
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (scheduledStart !== undefined) updateData.scheduledStart = scheduledStart ? new Date(scheduledStart) : null
    if (scheduledEnd !== undefined) updateData.scheduledEnd = scheduledEnd ? new Date(scheduledEnd) : null
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (zip !== undefined) updateData.zip = zip
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes
    if (techNotes !== undefined) updateData.techNotes = techNotes
    if (assignedToId !== undefined) {
      updateData.assignedTo = assignedToId ? { connect: { id: assignedToId } } : { disconnect: true }
    }
    if (serviceTypeId !== undefined) {
      updateData.serviceType = serviceTypeId ? { connect: { id: serviceTypeId } } : { disconnect: true }
    }
    
    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: updateData,
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/jobs/[id]]', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}
