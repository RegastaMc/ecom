import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import type { DefaultSession } from 'next-auth'

import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { db } from './db'
import { userRole } from '../../prisma/src/lib/prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: userRole
      email: string
      username: string
    } & DefaultSession['user']
    sessionToken?: string
  }
  interface NextAuthUser {
    id: string
    role: userRole
    email: string
    username: string
    password?: string
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
     GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,

      async profile(profile) {
        const user = await db.user.upsert({
          where: { email: profile.email },
          update: {
            name: profile.name,
            image: profile.picture as string,
            passwordhash: '',
          },
          create: {
            email: profile.email,
            name: profile.name,
            image: profile.picture as string,
            passwordhash: '',
          },
        })
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image as string,
          role: user.role as unknown as userRole,
          username: user.username ?? '',
        }
      },
    }),
    Credentials({
      authorize: async (credentials) => {
        // ensure we have credentials and a string password
        if (!credentials || typeof credentials.password !== 'string')
          return null

        const user = await db.user.findUnique({
          where: {
            email:
              typeof credentials.email === 'string'
                ? credentials.email
                : undefined,
          },
          select: {
            id: true,
            email: true,
            passwordhash: true,
            role: true,
            username: true,
            image: true,
          },
        })

        if (!user || !user.email || !user.passwordhash) {
          return null
        }

        const validDetails = await bcrypt.compare(
          credentials.password as string,
          user.passwordhash as string,
        )

        if (validDetails) {
          const validatedRole = Object.values(userRole).includes(
            user.role as unknown as userRole,
          )
            ? (user.role as unknown as userRole)
            : userRole.USER // Ensure role is valid
          return {
            ...user,
            role: validatedRole,
            email: user.email,
            username: user.username ?? '',
            image: user.image?.toString() ?? null,
          }
        } else {
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/signin',
  },

  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub as string
      session.user.role = token.role as unknown as userRole
      session.user.email = token.email as string
      session.user.username = token.username as string
      return session
    },
    async jwt({ token, user }) {
      if (user && 'role' in user) {
        if ('username' in user) {
          token.username = user.username
          token.role = user?.role as unknown as userRole
          token.sub = user.id
          token.email = user.email
        }
      }
      return token
    },
  },
  cookies: {
    sessionToken: {
      name: 'authtoken',
      options: {
        maxAge: 60 * 60 * 24,
      },
    },
  },
})
