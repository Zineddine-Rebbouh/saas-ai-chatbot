import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/', '/blogs(.*)', '/auth(.*)', '/portal(.*)', '/images(.*)', '/changelog', '/api/health'],
  ignoredRoutes: ['/chatbot', '/favicon.ico'],
})

export const config = {
  matcher: ['/((?!.+.[w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
