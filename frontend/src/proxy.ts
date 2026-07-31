import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check if we are running with placeholders (local mock demo)
  const isPlaceholder = 
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project') || 
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

  let user = null;

  if (isPlaceholder && request.cookies.get('sb-mock-session')?.value === 'true') {
    user = { id: 'mock-user-id', email: 'benson@zuri.clinic' };
  } else {
    try {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser()
      user = supabaseUser;
    } catch {
      // Ignore connection failures on placeholders
    }
  }

  const url = request.nextUrl.clone()

  // Protected paths
  const isProtectedRoute = 
    url.pathname.startsWith('/dashboard') || 
    url.pathname.startsWith('/inbox') || 
    url.pathname.startsWith('/settings') ||
    url.pathname === '/'

  if (isProtectedRoute && !user) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (url.pathname === '/login' && user) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, svgs (static media)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
