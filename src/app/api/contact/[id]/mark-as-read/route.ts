import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  // Update the contact's status to "READ" in the database
  const res = await db.contact.update({
    where: { id },
    data: { status: 'READ' },
  })

  return NextResponse.json(
    { message: 'Contact marked as read', res },
    { status: 200 },
  )
}
