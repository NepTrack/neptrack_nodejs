export type VehicleStatus =
  | 'running'
  | 'stop'
  | 'idle'
  | 'overspeed'
  | 'inactive'
  | 'nodata'
  | 'unknown';

export function parseVehicleStatus(s: unknown): VehicleStatus {
  switch (s) {
    case 'running':
    case 'stop':
    case 'idle':
    case 'overspeed':
    case 'inactive':
    case 'nodata':
      return s;
    default:
      return 'unknown';
  }
}

export function toDate(v: unknown): Date | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : parseInt(String(v), 10);
  if (!Number.isFinite(n) || n === 0) return null;
  return new Date(n);
}

export function toNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function toInt(v: unknown, fallback = 0): number {
  return Math.trunc(toNumber(v, fallback));
}

export function toBool(v: unknown): boolean {
  return v === true;
}

export function toString_(v: unknown, fallback = ''): string {
  return v == null ? fallback : String(v);
}

export function ymd(d: Date): string {
  const y = d.getFullYear().toString().padStart(4, '0');
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}
