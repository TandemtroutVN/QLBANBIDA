export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function calculateHours(startTime) {
  if (!startTime) return 0;
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours;
}

export function formatElapsed(startTime) {
  if (!startTime) return '';
  const h = calculateHours(startTime);
  const hrs = Math.floor(h);
  const mins = Math.floor((h - hrs) * 60);
  const secs = Math.floor(((h - hrs) * 60 - mins) * 60);
  return `${hrs}h${mins.toString().padStart(2, '0')}m${secs.toString().padStart(2, '0')}s`;
}

export function calculateTableCost(hours, hourlyRate) {
  return hours * hourlyRate;
}

export function roundTotal(amount) {
  const remainder = amount % 1000;
  if (remainder >= 500) return amount + (1000 - remainder);
  return amount - remainder;
}
