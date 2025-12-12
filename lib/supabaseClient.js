



// lib/supabaseClient.js
/**
 * Supabase Client Setup
 * 
 * Required environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon/public key
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (server-side only, never expose in browser)
 */

import { createClient } from '@supabase/supabase-js';

// Validate environment variables for client-side use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail fast in development if env vars are missing
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = '❌ Supabase environment variables are not configured.';
  console.error(errorMsg);
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  
  // In production, we'll create a client that will fail gracefully
  // In development, we want to fail fast
  if (process.env.NODE_ENV === 'development') {
    throw new Error(errorMsg + ' Please check your .env.local file.');
  }
}

// Create and export the Supabase client for browser-side use (respects RLS)
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token',
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'self-upgrade-planner'
      }
    }
  }
);

// ADMIN CLIENT: For server-side use ONLY (bypasses RLS)
// NEVER expose this on the client. Requires service role key.
export const createAdminClient = () => {
  // Check if we are on the server
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient() must run on server only');
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for admin client');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'self-upgrade-planner-admin'
      }
    }
  });
};

// Helper functions for auth
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
    }
    
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Create or update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Test connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Connected to Supabase successfully',
      data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to connect to Supabase',
      error: error.message
    };
  }
};