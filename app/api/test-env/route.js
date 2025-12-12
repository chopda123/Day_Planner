// app/api/test-env/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasPublicUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    environment: process.env.NODE_ENV
  });
}