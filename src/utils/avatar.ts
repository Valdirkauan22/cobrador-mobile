export function getInitials(name: unknown): string {
  const str = String(name ?? '').trim();
  if (!str) return '??';
  const clean = str.split(/\s+/).filter(Boolean);
  if (clean.length === 0) return '??';
  if (clean.length === 1) {
    return clean[0].slice(0, 2).toUpperCase();
  }
  return (clean[0][0] + clean[clean.length - 1][0]).toUpperCase();
}

const AVATAR_PALETTES = [
  { bg: 'bg-sky-50 text-sky-800 border-sky-200' },
  { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  { bg: 'bg-teal-50 text-teal-800 border-teal-200' },
  { bg: 'bg-slate-100 text-slate-800 border-slate-300' },
  { bg: 'bg-violet-50 text-violet-800 border-violet-200' }
];

export function getAvatarStyle(name: unknown): string {
  const str = String(name ?? '').trim();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx].bg;
}
