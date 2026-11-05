'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { InternalAccount, Role } from '@/types';
import { revalidatePath } from 'next/cache';

/**
 * loginAction
 * Memvalidasi kredensial login via Supabase Auth SSR.
 * Memastikan akun terdaftar di staff_profiles dan berstatus is_active = true.
 */
export async function loginAction(formData: { email: string; password: string }) {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: formData.email.trim(),
    password: formData.password,
  });

  if (authError || !authData.user) {
    return {
      success: false as const,
      error: 'INVALID_CREDENTIALS',
      message: 'Email atau password tidak sesuai.',
    };
  }

  // Verifikasi staff profile & status aktif
  const { data: profile, error: profileError } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return {
      success: false as const,
      error: 'PROFILE_NOT_FOUND',
      message: 'Akun ini tidak memiliki profil kepanitiaan MEMORIA.',
    };
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return {
      success: false as const,
      error: 'ACCOUNT_INACTIVE',
      message: 'Akun panitia Anda telah dinonaktifkan oleh Administrator.',
    };
  }

  const roleNormalized: Role =
    profile.role === 'admin' || profile.role === 'ADMIN_PANITIA'
      ? 'ADMIN_PANITIA'
      : 'PETUGAS_CHECKIN';

  const fullName = (profile as any).name || (profile as any).full_name || profile.email;

  return {
    success: true as const,
    user: {
      id: profile.id,
      fullName,
      email: profile.email,
      role: roleNormalized,
      status: 'ACTIVE' as const,
    },
    redirectTo: roleNormalized === 'ADMIN_PANITIA' ? '/panitia' : '/panitia/check-in',
  };
}

/**
 * logoutAction
 * Mengakhiri sesi login staff panitia.
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/panitia', 'layout');
  return { success: true };
}

/**
 * getCurrentStaffSession
 * Memeriksa sesi saat ini dan mengembalikan profil staff aktif.
 */
export async function getCurrentStaffSession(): Promise<InternalAccount | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.is_active) return null;

    const roleNormalized: Role =
      profile.role === 'admin' || profile.role === 'ADMIN_PANITIA'
        ? 'ADMIN_PANITIA'
        : 'PETUGAS_CHECKIN';

    const fullName = (profile as any).name || (profile as any).full_name || profile.email;

    return {
      id: profile.id,
      fullName,
      email: profile.email,
      role: roleNormalized,
      status: profile.is_active ? 'ACTIVE' : 'INACTIVE',
    };
  } catch {
    return null;
  }
}

/**
 * listAccountsAction (Admin Only)
 */
export async function listAccountsAction(): Promise<{ success: boolean; data?: InternalAccount[]; message?: string }> {
  const currentUser = await getCurrentStaffSession();
  if (!currentUser || currentUser.role !== 'ADMIN_PANITIA') {
    return { success: false, message: 'Hanya Admin Panitia yang berhak melihat daftar akun.' };
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('staff_profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return { success: false, message: error.message };
  }

  const mapped: InternalAccount[] = (data || []).map((row: any) => ({
    id: row.id,
    fullName: row.name || row.full_name || row.email,
    email: row.email,
    role: (row.role === 'admin' || row.role === 'ADMIN_PANITIA') ? 'ADMIN_PANITIA' : 'PETUGAS_CHECKIN',
    status: row.is_active ? 'ACTIVE' : 'INACTIVE',
  }));

  return { success: true, data: mapped };
}

/**
 * createAccountAction (Admin Only)
 */
export async function createAccountAction(payload: {
  fullName: string;
  email: string;
  role: Role;
  password: string;
}) {
  const currentUser = await getCurrentStaffSession();
  if (!currentUser || currentUser.role !== 'ADMIN_PANITIA') {
    return { success: false, message: 'Hanya Admin Panitia yang berhak membuat akun.' };
  }

  const adminClient = createAdminClient();

  // 1. Create user di Supabase Auth
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email: payload.email.trim(),
    password: payload.password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return { success: false, message: authError?.message || 'Gagal membuat user auth' };
  }

  // 2. Insert ke staff_profiles (kompatibel dengan schema name dan role)
  const roleDb = payload.role === 'ADMIN_PANITIA' ? 'admin' : 'petugas_checkin';
  const { error: profileError } = await adminClient.from('staff_profiles').insert({
    id: authUser.user.id,
    name: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    role: roleDb,
    is_active: true,
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authUser.user.id);
    return { success: false, message: profileError.message };
  }

  revalidatePath('/panitia/akun');
  return { success: true };
}

/**
 * updateAccountAction (Admin Only)
 */
export async function updateAccountAction(payload: {
  id: string;
  fullName: string;
  role: Role;
}) {
  const currentUser = await getCurrentStaffSession();
  if (!currentUser || currentUser.role !== 'ADMIN_PANITIA') {
    return { success: false, message: 'Hanya Admin Panitia yang berhak mengedit akun.' };
  }

  const adminClient = createAdminClient();

  // Lindungi Admin terakhir dari penurunan role
  if (payload.role !== 'ADMIN_PANITIA') {
    const { count } = await adminClient
      .from('staff_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'ADMIN_PANITIA')
      .eq('is_active', true);

    if (count !== null && count <= 1) {
      const { data: target } = await adminClient
        .from('staff_profiles')
        .select('role')
        .eq('id', payload.id)
        .single();

      if (target?.role === 'ADMIN_PANITIA') {
        return { success: false, message: 'Tidak dapat mengubah role Admin terakhir dalam sistem.' };
      }
    }
  }

  const roleDb = payload.role === 'ADMIN_PANITIA' ? 'admin' : 'petugas_checkin';
  const { error } = await adminClient
    .from('staff_profiles')
    .update({
      name: payload.fullName.trim(),
      role: roleDb,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.id);

  if (error) return { success: false, message: error.message };

  revalidatePath('/panitia/akun');
  return { success: true };
}

/**
 * toggleAccountStatusAction (Admin Only)
 */
export async function toggleAccountStatusAction(payload: { id: string; targetStatus: 'ACTIVE' | 'INACTIVE' }) {
  const currentUser = await getCurrentStaffSession();
  if (!currentUser || currentUser.role !== 'ADMIN_PANITIA') {
    return { success: false, message: 'Hanya Admin Panitia yang berhak mengubah status akun.' };
  }

  const adminClient = createAdminClient();
  const willDeactivate = payload.targetStatus === 'INACTIVE';

  if (willDeactivate) {
    const { count } = await adminClient
      .from('staff_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'ADMIN_PANITIA')
      .eq('is_active', true);

    if (count !== null && count <= 1) {
      const { data: target } = await adminClient
        .from('staff_profiles')
        .select('role')
        .eq('id', payload.id)
        .single();

      if (target?.role === 'ADMIN_PANITIA') {
        return { success: false, message: 'Tidak dapat menonaktifkan Admin aktif terakhir dalam sistem.' };
      }
    }
  }

  const { error } = await adminClient
    .from('staff_profiles')
    .update({
      is_active: !willDeactivate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.id);

  if (error) return { success: false, message: error.message };

  revalidatePath('/panitia/akun');
  return { success: true };
}

/**
 * resetAccountPasswordAction (Admin Only)
 */
export async function resetAccountPasswordAction(payload: { id: string; newPassword: string }) {
  const currentUser = await getCurrentStaffSession();
  if (!currentUser || currentUser.role !== 'ADMIN_PANITIA') {
    return { success: false, message: 'Hanya Admin Panitia yang berhak mereset password akun.' };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(payload.id, {
    password: payload.newPassword,
  });

  if (error) return { success: false, message: error.message };

  return { success: true };
}

