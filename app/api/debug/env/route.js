import { NextResponse } from 'next/server';

export async function GET() {
  // NEVER expose the full service key in production!
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (hidden)' : 'Not set',
    NODE_ENV: process.env.NODE_ENV
  };
  
  return NextResponse.json({
    environment: env,
    note: 'Service key is hidden for security'
  });
}