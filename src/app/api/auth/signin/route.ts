import { signIn } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import * as z from 'zod'

const SignInSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),

  password: z.string().min(6, {
    message: 'Password must be at least 6 characters long',
  }),
})

export async function POST(req: Request) {
  try {
    const body = await req.formData()

    const email = body.get('email')
    const password = body.get('password')

    const validDetails = SignInSchema.parse({ email, password })

    if (!validDetails) {
      return NextResponse.json(
        { message: 'Invalid input data' },
        { status: 400 },
      )
    }

    const userExists = await db.user.findFirst({
      where: {
        email: validDetails.email,
      },
    })

    if (!userExists) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 },
      )
    }

    await signIn('credentials', {
      email: validDetails.email,
      password: validDetails.password,
      redirect: false,
    })

    return NextResponse.json(
      {
        user: userExists,
        message: 'Signed in successfully,redirecting...',
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('error occured:', error)
    return NextResponse.json(
      { message: 'Failed,check your email or password' },
      { status: 500 },
    )
  }
}
