// /app/api/users/get-or-create/route.js
import { createAdminClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('📝 Users get-or-create API called');
    
    const body = await request.json();
    const { email, full_name } = body;
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }
    
    const supabaseAdmin = createAdminClient();
    
    // Check if user exists
    console.log('Checking for existing user with email:', email);
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle(); // Use maybeSingle to handle no results
    
    if (checkError) {
      console.error('Error checking user:', checkError);
      throw checkError;
    }
    
    let userId;
    
    if (existingUser) {
      // User exists, return their ID
      userId = existingUser.id;
      console.log('Existing user found:', userId);
    } else {
      // Create new user
      console.log('Creating new user...');
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          full_name: full_name || 'Test User',
          timezone: 'UTC'
        })
        .select('id')
        .single();
      
      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }
      
      userId = newUser.id;
      console.log('New user created:', userId);
    }
    
    return NextResponse.json({
      success: true,
      userId,
      message: existingUser ? 'Existing user found' : 'New user created'
    });
    
  } catch (error) {
    console.error('❌ Error in users/get-or-create:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get or create user',
      details: error.message
    }, { status: 500 });
  }
}