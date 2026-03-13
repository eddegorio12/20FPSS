import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"

const providers: any[] = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code",
        scope: "openid email profile https://www.googleapis.com/auth/calendar.events"
      }
    }
  }),
]

if (process.env.NODE_ENV === 'development') {
  providers.push(
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin@test.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.username === "admin@test.com" && credentials?.password === "admin") {
          return { id: "1", name: "Test Admin", email: "admin@test.com", role: "ADMIN" }
        }
        return null
      }
    })
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt",  // JWT = no DB lookup on every page load
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, user is available — save role into the JWT
      if (user) {
        token.id = user.id
        token.role = (user as any).role ?? 'TEACHER'
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/',
    error: '/',
  }
})
