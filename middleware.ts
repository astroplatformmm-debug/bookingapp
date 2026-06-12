// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin dashboard routes
  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/slots')) {
    const token = req.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin/') && !pathname.endsWith('/login') && !pathname.endsWith('/logout')) {
    const token = req.cookies.get('admin_token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin/slots/:path*', '/api/admin/:path*'],
};
