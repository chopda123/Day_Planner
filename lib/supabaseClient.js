





// import { createClient } from '@supabase/supabase-js';

// // Validate environment variables
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error('Missing Supabase environment variables:');
//   console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
//   console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  
//   // Create a mock client for development that logs errors
//   const mockClient = {
//     auth: {
//       getSession: async () => ({ data: { session: null }, error: new Error('Supabase not configured') }),
//       getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
//       signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
//       signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
//       signOut: async () => ({ error: new Error('Supabase not configured') }),
//       onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
//     },
//     from: () => ({
//       select: () => ({
//         eq: () => ({
//           order: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') })
//         }),
//         single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
//       }),
//       insert: () => ({
//         select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
//         single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
//       }),
//       update: () => ({
//         eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
//       })
//     })
//   };
  
//   // Client for browser-side use (respects RLS). Requires anon key.
//   export const supabase = mockClient;
// } else {
//   // Client for browser-side use (respects RLS). Requires anon key.
//   export const supabase = createClient(
//     supabaseUrl,
//     supabaseAnonKey,
//     {
//       auth: {
//         persistSession: true,
//         autoRefreshToken: true,
//         detectSessionInUrl: true,
//         storage: typeof window !== 'undefined' ? window.localStorage : undefined,
//         storageKey: 'supabase.auth.token',
//         flowType: 'pkce'
//       },
//       global: {
//         headers: {
//           'X-Client-Info': 'self-upgrade-planner'
//         }
//       }
//     }
//   );
// }

// // ADMIN CLIENT: For server-side use ONLY (bypasses RLS).
// // NEVER expose this on the client. Requires service role key.
// export const createAdminClient = () => {
//   // Check if we are on the server
//   if (typeof window !== 'undefined') {
//     throw new Error('Admin client cannot be used in the browser');
//   }
  
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
//   if (!supabaseUrl || !supabaseServiceKey) {
//     console.error('Missing Supabase admin environment variables:');
//     console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
//     throw new Error('Missing Supabase environment variables for admin client');
//   }
  
//   return createClient(supabaseUrl, supabaseServiceKey, {
//     auth: {
//       persistSession: false,
//       autoRefreshToken: false,
//       detectSessionInUrl: false
//     },
//     global: {
//       headers: {
//         'X-Client-Info': 'self-upgrade-planner-admin'
//       }
//     }
//   });
// };

// // Auth helper functions
// export const getCurrentUser = async () => {
//   try {
//     const { data: { user }, error } = await supabase.auth.getUser();
//     if (error) {
//       console.error('Error getting user:', error);
//       throw error;
//     }
//     return user;
//   } catch (error) {
//     console.error('Failed to get current user:', error);
//     return null;
//   }
// };

// export const getSession = async () => {
//   try {
//     const { data: { session }, error } = await supabase.auth.getSession();
//     if (error) {
//       console.error('Error getting session:', error);
//       throw error;
//     }
//     return session;
//   } catch (error) {
//     console.error('Failed to get session:', error);
//     return null;
//   }
// };

// export const signOut = async () => {
//   try {
//     const { error } = await supabase.auth.signOut();
//     if (error) throw error;
    
//     // Clear local storage
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem('supabase.auth.token');
//     }
    
//     return true;
//   } catch (error) {
//     console.error('Error signing out:', error);
//     throw error;
//   }
// };

// export const requireAuth = async () => {
//   const user = await getCurrentUser();
//   if (!user) {
//     throw new Error('Authentication required');
//   }
//   return user;
// };

// // Check if user is authenticated
// export const isAuthenticated = async () => {
//   try {
//     const session = await getSession();
//     return !!session;
//   } catch (error) {
//     console.error('Error checking authentication:', error);
//     return false;
//   }
// };

// // Get user profile
// export const getUserProfile = async (userId) => {
//   try {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('id', userId)
//       .single();
    
//     if (error) throw error;
//     return data;
//   } catch (error) {
//     console.error('Error getting user profile:', error);
//     return null;
//   }
// };

// // Create or update user profile
// export const updateUserProfile = async (userId, profileData) => {
//   try {
//     const { data, error } = await supabase
//       .from('profiles')
//       .upsert({
//         id: userId,
//         ...profileData,
//         updated_at: new Date().toISOString()
//       })
//       .select()
//       .single();
    
//     if (error) throw error;
//     return data;
//   } catch (error) {
//     console.error('Error updating user profile:', error);
//     throw error;
//   }
// };

// // Auth state change listener helper
// export const onAuthStateChange = (callback) => {
//   return supabase.auth.onAuthStateChange((event, session) => {
//     console.log('Auth state changed:', event, session?.user?.email);
//     callback(event, session);
//   });
// };

// // Debug helper to check auth state
// export const debugAuthState = async () => {
//   try {
//     const session = await getSession();
//     const user = await getCurrentUser();
    
//     console.log('=== AUTH DEBUG INFO ===');
//     console.log('Session exists:', !!session);
//     console.log('User exists:', !!user);
//     console.log('Session expiry:', session?.expires_at ? new Date(session.expires_at * 1000) : 'N/A');
//     console.log('User email:', user?.email);
//     console.log('Local storage token:', typeof window !== 'undefined' ? localStorage.getItem('supabase.auth.token') : 'N/A');
//     console.log('========================');
    
//     return { session, user };
//   } catch (error) {
//     console.error('Debug auth error:', error);
//     return { session: null, user: null };
//   }
// };




import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set
const areEnvVarsSet = !!(supabaseUrl && supabaseAnonKey);

if (!areEnvVarsSet) {
  console.warn('⚠️ Supabase environment variables are not fully configured');
  console.warn('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'Missing');
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set (hidden)' : 'Missing');
}

// Create Supabase client - always create it, even if env vars are missing
// The client will fail gracefully when used without proper config
const createSupabaseClient = () => {
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(
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
  } else {
    // Return a mock client that logs errors when used
    console.error('❌ Supabase client created without environment variables');
    return {
      auth: {
        getSession: async () => ({ 
          data: { session: null }, 
          error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
        }),
        getUser: async () => ({ 
          data: { user: null }, 
          error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
        }),
        signInWithPassword: async () => ({ 
          data: { user: null, session: null }, 
          error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
        }),
        signUp: async () => ({ 
          data: { user: null, session: null }, 
          error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
        }),
        signOut: async () => ({ 
          error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
        }),
        onAuthStateChange: () => ({ 
          data: { 
            subscription: { 
              unsubscribe: () => {} 
            } 
          } 
        })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ 
              data: [], 
              error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
            })
          }),
          single: () => Promise.resolve({ 
            data: null, 
            error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
          })
        }),
        insert: () => ({
          select: () => Promise.resolve({ 
            data: null, 
            error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
          }),
          single: () => Promise.resolve({ 
            data: null, 
            error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
          })
        }),
        update: () => ({
          eq: () => Promise.resolve({ 
            data: null, 
            error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
          })
        }),
        upsert: () => ({
          select: () => Promise.resolve({ 
            data: null, 
            error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
          }),
          single: () => Promise.resolve({ 
            data: null, 
            error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
          })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ 
            data: null, 
            error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
          })
        })
      }),
      rpc: () => Promise.resolve({ 
        data: null, 
        error: new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local') 
      })
    };
  }
};

// Create and export the Supabase client
export const supabase = createSupabaseClient();

// ADMIN CLIENT: For server-side use ONLY (bypasses RLS).
// NEVER expose this on the client. Requires service role key.
export const createAdminClient = () => {
  // Check if we are on the server
  if (typeof window !== 'undefined') {
    throw new Error('Admin client cannot be used in the browser');
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

// Auth helper functions
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

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const session = await getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
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

// Auth state change listener helper
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    callback(event, session);
  });
};

// Debug helper to check auth state
export const debugAuthState = async () => {
  try {
    const session = await getSession();
    const user = await getCurrentUser();
    
    console.log('=== AUTH DEBUG INFO ===');
    console.log('Session exists:', !!session);
    console.log('User exists:', !!user);
    console.log('Session expiry:', session?.expires_at ? new Date(session.expires_at * 1000) : 'N/A');
    console.log('User email:', user?.email);
    console.log('Local storage token:', typeof window !== 'undefined' ? localStorage.getItem('supabase.auth.token') : 'N/A');
    console.log('========================');
    
    return { session, user };
  } catch (error) {
    console.error('Debug auth error:', error);
    return { session: null, user: null };
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