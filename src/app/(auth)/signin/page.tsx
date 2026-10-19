import Signin from '@/components/forms/(auth)/Signin'
import { auth } from '@/lib/auth'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function Page() {
  const user = await auth()
  if (user) {
    redirect('/')
  }
  return <Signin />
}
