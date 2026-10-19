import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.formData()

    const email = data.get('email')
    const password = data.get('password')

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Invalid input data' },
        { status: 400 },
      )
    }

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Invalid input data' },
        { status: 400 },
      )
    }
    const existingUser = await db.user.findFirst({
      where: {
        email: email.toString().toLowerCase(),
      },
    })
    if (existingUser) {
      return NextResponse.json(
        {
          user: null,
          message: 'User exists',
        },
        { status: 409 },
      )
    }

    const lowerCaseEmail = email
    const pwd = await bcrypt.hash(password.toString(), 15)

    const newUser = await db.user.create({
      data: {
        email: lowerCaseEmail.toString().toLowerCase(),
        passwordhash: pwd.toString(),
      },
    })
    return NextResponse.json(
      {
        user: newUser,
        message: 'Registration successful',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error occured:', error)
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Hello there' }, { status: 200 })
}
