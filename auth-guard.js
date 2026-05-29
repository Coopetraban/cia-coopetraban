import { supabase } from './supabase-client.js';

/**
 * Verifica sesión activa y rol permitido.
 * Si no hay sesión o el rol no coincide → redirige a login.
 * @param {string[]} rolesPermitidos  ej: ['usuario','admin']
 * @param {string}   loginPath        ruta al index.html
 */
export async function requireAuth(rolesPermitidos = [], loginPath = '../index.html') {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    location.href = loginPath;
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    await supabase.auth.signOut();
    location.href = loginPath;
    return null;
  }

  if (rolesPermitidos.length && !rolesPermitidos.includes(profile.rol)) {
    location.href = loginPath;
    return null;
  }

  return profile; // { id, email, nombre, rol, area }
}

export async function logout(loginPath = '../index.html') {
  await supabase.auth.signOut();
  location.href = loginPath;
}
