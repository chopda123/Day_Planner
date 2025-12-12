


import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('🔐 Telegram OTP verification API called');
    
    const body = await request.json();
    const { otp, userId } = body;
    
    console.log('Received:', { otp, userId });
    
    if (!otp || !userId) {
      return NextResponse.json(
        { success: false, message: 'OTP and userId are required' },
        { status: 400 }
      );
    }
    
    // Call Supabase Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/telegram-bot/verify`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ otp, userId })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Edge function failed: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Edge function response:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error in telegram/verify:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}