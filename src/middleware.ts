import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

/**
 * Middleware is kept as a placeholder. 
 * Real-time auth protection is handled via client-side hooks in components/DashboardLayout.tsx
 * to stay compatible with Firebase Client SDK's persistent sessions.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
