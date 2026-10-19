import Signup from '@/components/forms/(auth)/Signup'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function Page() {
  const user = await auth()
  if (user) {
    redirect('/')
  }
  return <Signup />
}
