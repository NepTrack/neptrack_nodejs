import {
  VehicleStatus,
  parseVehicleStatus,
  toDate,
  toInt,
  toNumber,
  toString_,
} from './common';

export interface ReportVehicle {
  regNo: string;
  name: string;
  type: string;
  status: VehicleStatus;
  todayKm: number;
  speed: number;
  lastPlace: string;
  lastTime: Date | null;
}

export interface ReportStats {
  totalKm: number;
  runningMs: number;
  idleMs: number;
  overspeedMs: number;
  stopMs: number;
  maxSpeed: number;
  trips: number;
}

export interface DailyStat {
  date: string;
  km: number;
  avgSpeed: number;
  overspeed: number;
}

export interface ReportResponse {
  vehicle: ReportVehicle;
  stats: ReportStats;
  table: DailyStat[];
}

export function parseReportVehicle(
  j: Record<string, unknown>,
): ReportVehicle {
  return {
    regNo: toString_(j.reg_no),
    name: toString_(j.name),
    type: toString_(j.type),
    status: parseVehicleStatus(j.status),
    todayKm: toNumber(j.today_km),
    speed: toNumber(j.speed),
    lastPlace: toString_(j.last_place),
    lastTime: toDate(j.last_time),
  };
}

export function parseReportStats(j: Record<string, unknown>): ReportStats {
  return {
    totalKm: toNumber(j.total_km),
    runningMs: toInt(j.running_ms),
    idleMs: toInt(j.idle_ms),
    overspeedMs: toInt(j.overspeed_ms),
    stopMs: toInt(j.stop_ms),
    maxSpeed: toNumber(j.max_speed),
    trips: toInt(j.trips),
  };
}

export function parseDailyStat(j: Record<string, unknown>): DailyStat {
  return {
    date: toString_(j.date),
    km: toNumber(j.km),
    avgSpeed: toNumber(j.aspeed),
    overspeed: toNumber(j.ospeed),
  };
}

export function parseReportResponse(
  j: Record<string, unknown>,
): ReportResponse {
  return {
    vehicle: parseReportVehicle(
      (j.vehicle as Record<string, unknown>) ?? {},
    ),
    stats: parseReportStats((j.stats as Record<string, unknown>) ?? {}),
    table: ((j.table as unknown[]) ?? []).map((e) =>
      parseDailyStat(e as Record<string, unknown>),
    ),
  };
}
