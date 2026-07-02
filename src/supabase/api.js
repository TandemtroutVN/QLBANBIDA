import { supabase } from './client';

export async function fetchTables() {
  const { data, error } = await supabase.from('tables').select('*').order('id');
  if (error) throw error;
  return data;
}

export async function upsertTable(table) {
  const { error } = await supabase.from('tables').upsert(table);
  if (error) throw error;
}

export async function deleteTable(id) {
  const { error } = await supabase.from('tables').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchMenu() {
  const { data, error } = await supabase.from('menu_items').select('*').order('id');
  if (error) throw error;
  return data;
}

export async function upsertMenuItem(item) {
  const { error } = await supabase.from('menu_items').upsert(item);
  if (error) throw error;
}

export async function deleteMenuItem(id) {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}
