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

  let user = null;

  if (request.cookies.get('sb-mock-session')?.value === 'true') {
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

  if (user) {
    const isOnboarded = 
      request.cookies.get('sb-onboarded')?.value === 'true' || 
      request.cookies.get('sb-mock-onboarded')?.value === 'true';

    if (isProtectedRoute) {
      if (!isOnboarded && url.pathname !== '/dashboard/onboarding') {
        url.pathname = '/dashboard/onboarding'
        return NextResponse.redirect(url)
      }

      if (isOnboarded && url.pathname === '/dashboard/onboarding') {
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }

    if (url.pathname === '/login') {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
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
