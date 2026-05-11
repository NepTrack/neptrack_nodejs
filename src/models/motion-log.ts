import {
  VehicleStatus,
  parseVehicleStatus,
  toDate,
  toInt,
  toNumber,
  toString_,
} from './common';

export interface MotionLog {
  vehId: number;
  regNo: string;
  vehName: string;
  vehType: string;
  fromStatus: VehicleStatus;
  toStatus: VehicleStatus;
  speed: number;
  lat: number;
  lon: number;
  eventTime: Date;
  eventFmt: string;
  receivedFmt: string;
  timeAgo: string;
}

export interface MotionLogsResponse {
  total: number;
  page: number;
  perPage: number;
  motions: MotionLog[];
}

export function parseMotionLog(j: Record<string, unknown>): MotionLog {
  return {
    vehId: toInt(j.veh_id),
    regNo: toString_(j.reg_no),
    vehName: toString_(j.veh_name),
    vehType: toString_(j.veh_type),
    fromStatus: parseVehicleStatus(j.from_status),
    toStatus: parseVehicleStatus(j.to_status),
    speed: toNumber(j.speed),
    lat: toNumber(j.lat),
    lon: toNumber(j.lon),
    eventTime: new Date(toInt(j.event_time_ms)),
    eventFmt: toString_(j.event_fmt),
    receivedFmt: toString_(j.received_fmt),
    timeAgo: toString_(j.time_ago),
  };
}

export function parseMotionLogsResponse(
  j: Record<string, unknown>,
): MotionLogsResponse {
  return {
    total: toInt(j.total),
    page: toInt(j.page, 1),
    perPage: toInt(j.per_page, 50),
    motions: ((j.motions as unknown[]) ?? []).map((e) =>
      parseMotionLog(e as Record<string, unknown>),
    ),
  };
}
