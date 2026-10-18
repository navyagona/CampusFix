import { cookies } from 'next/headers';
import { Profile } from '@/types/database';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mockStore, INITIAL_PROFILES } from '@/lib/data/mock-store';

const DEMO_USER_COOKIE = 'campusfix_user_id';

/**
 * Retrieves the current authenticated user profile
 * Handles both Supabase Auth sessions and local Demo mode sessions
 */
export async function getCurrentUser(): Promise<Profile | null> {
  // If Supabase is configured with real credentials, check the Supabase auth session
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (!supabase) return null;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) return profile as Profile;

      return {
        id: user.id,
        email: user.email || '',
        full_name: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'User',
        role: (user.user_metadata?.role as Profile['role']) || 'student',
        created_at: user.created_at,
      };
    } catch {
      // Fallback to demo mode if database connection fails
    }
  }

  // Demo / local mode
  const cookieStore = await cookies();
  const demoUserId = cookieStore.get(DEMO_USER_COOKIE)?.value;

  if (demoUserId) {
    const profile = mockStore.getProfileById(demoUserId);
    if (profile) return profile;
  }

  // Default demo user: Alex Chen (Student)
  return INITIAL_PROFILES[0];
}

/**
 * Switch demo user in demo mode (sets cookie)
 */
export async function setDemoUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_USER_COOKIE, userId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });
}
