let serverOffset = 0;

export async function syncServerTime() {
  try {
    const res = await fetch('https://worldtimeapi.org/api/timezone/Asia/Ho_Chi_Minh');
    const data = await res.json();
    serverOffset = data.unixtime * 1000 - Date.now();
  } catch {
    serverOffset = 0;
  }
}

export function getServerNow() {
  return new Date(Date.now() + serverOffset);
}
