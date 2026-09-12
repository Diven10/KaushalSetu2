export function pct(value, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function pp(value, digits = 1) {
  const sign = value > 0 ? '+' : value < 0 ? '' : '±';
  return `${sign}${value.toFixed(digits)} pp`;
}

export function inr(value) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${Math.round(value)}`;
}

export function inrExact(value) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function compactNumber(value) {
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function fullNumber(value) {
  return new Intl.NumberFormat('en-IN').format(Math.round(value));
}

export function trendDirection(value) {
  if (value > 0.05) return 'up';
  if (value < -0.05) return 'down';
  return 'flat';
}

export function statusFromScore(score) {
  if (score >= 80) return 'HEALTHY';
  if (score >= 65) return 'WATCH';
  if (score >= 50) return 'AT RISK';
  return 'CRITICAL';
}

export function trendCategory(delta) {
  if (delta >= 4) return 'Improving';
  if (delta >= -1) return 'Stable';
  if (delta >= -6) return 'Declining';
  return 'Significant Decline';
}

export function nowStamp() {
  return new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
