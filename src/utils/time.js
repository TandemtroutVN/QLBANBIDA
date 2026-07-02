import { supabase } from '../supabase/client';

let serverOffset = 0;

export async function syncServerTime() {
  try {
    const { data, error } = await supabase.rpc('get_server_time');
    if (error) throw error;
    serverOffset = new Date(data).getTime() - Date.now();
  } catch {
    const res = await fetch('https://worldtimeapi.org/api/timezone/Asia/Ho_Chi_Minh');
    const d = await res.json();
    serverOffset = d.unixtime * 1000 - Date.now();
  }
}

export function getServerNow() {
  return new Date(Date.now() + serverOffset);
}
