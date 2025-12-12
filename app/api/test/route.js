// app/api/test/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Test endpoint called');
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Yes (hidden)' : 'No',
      nodeEnv: process.env.NODE_ENV
    }
  });
}