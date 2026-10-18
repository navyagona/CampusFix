'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { setDemoUser } from '@/lib/auth/session';
import { mockStore } from '@/lib/data/mock-store';
import { loginSchema, signupSchema, LoginInput, SignupInput } from '@/lib/validations/auth';

export async function switchDemoUserAction(userId: string) {
  await setDemoUser(userId);
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function loginAction(data: LoginInput) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) return { success: false, error: error.message };
        revalidatePath('/', 'layout');
        return { success: true };
      }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Authentication failed' };
    }
  }

  // Demo fallback: Find or create profile
  const existing = mockStore.getProfiles().find((p) => p.email.toLowerCase() === parsed.data.email.toLowerCase());
  if (existing) {
    await setDemoUser(existing.id);
    revalidatePath('/', 'layout');
    return { success: true, profile: existing };
  }

  // If not found in demo, default to Alex Chen or create student
  const newProfile = {
    id: crypto.randomUUID(),
    email: parsed.data.email,
    full_name: parsed.data.email.split('@')[0],
    role: 'student' as const,
    created_at: new Date().toISOString(),
  };
  mockStore.addProfile(newProfile);
  await setDemoUser(newProfile.id);
  revalidatePath('/', 'layout');
  return { success: true, profile: newProfile };
}

export async function signupAction(data: SignupInput) {
  const parsed = signupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            data: {
              full_name: parsed.data.full_name,
              role: parsed.data.role,
            },
          },
        });
        if (error) return { success: false, error: error.message };

        // Ensure profile inserted
        if (authData.user) {
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: parsed.data.email,
            full_name: parsed.data.full_name,
            role: parsed.data.role,
          });
        }

        revalidatePath('/', 'layout');
        return { success: true };
      }
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : 'Registration failed' };
    }
  }

  // Demo fallback
  const newProfile = {
    id: crypto.randomUUID(),
    email: parsed.data.email,
    full_name: parsed.data.full_name,
    role: parsed.data.role,
    created_at: new Date().toISOString(),
  };
  mockStore.addProfile(newProfile);
  await setDemoUser(newProfile.id);
  revalidatePath('/', 'layout');
  return { success: true, profile: newProfile };
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {
      // ignore
    }
  }
  const cookieStore = await cookies();
  cookieStore.delete('campusfix_user_id');
  revalidatePath('/', 'layout');
  return { success: true };
}
