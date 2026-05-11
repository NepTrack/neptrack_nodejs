import {
  VehicleStatus,
  parseVehicleStatus,
  toBool,
  toDate,
  toInt,
  toNumber,
  toString_,
} from './common';

export interface Vehicle {
  vehId: number;
  imei: string;
  regNo: string;
  name: string;
  type: string;
  status: VehicleStatus;
  speed: number;
  todayKm: number;
  lat: number;
  lng: number;
  bearing: number;
  altitude: number;
  battery: number;
  gsm: number;
  sat: number;
  gps: boolean;
  charging: boolean;
  relay: boolean;
  odometer: number;
  lastPlace: string;
  lastTime: Date | null;
  stime: Date | null;
}

export interface VehicleCounts {
  all: number;
  running: number;
  stop: number;
  idle: number;
  overspeed: number;
  inactive: number;
  nodata: number;
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  counts: VehicleCounts;
}

/** Detailed vehicle from `GET /vehicles/{veh_id}`. */
export interface VehicleDetail {
  vehId: number;
  regNo: string;
  name: string;
  type: string;
  /** Overspeed threshold km/h. */
  overspeed: number;
  odometer: number;
  /** km / litre. */
  mileage: number;
  /** Low fuel threshold (%). */
  lowFuel: number;
}

export function parseVehicle(j: Record<string, unknown>): Vehicle {
  return {
    vehId: toInt(j.veh_id),
    imei: toString_(j.imei),
    regNo: toString_(j.reg_no),
    name: toString_(j.name),
    type: toString_(j.type),
    status: parseVehicleStatus(j.status),
    speed: toNumber(j.speed),
    todayKm: toNumber(j.today_km),
    lat: toNumber(j.lat),
    lng: toNumber(j.lng),
    bearing: toNumber(j.bearing),
    altitude: toNumber(j.altitude),
    battery: toInt(j.battery),
    gsm: toInt(j.gsm),
    sat: toInt(j.sat),
    gps: toBool(j.gps),
    charging: toBool(j.charging),
    relay: toBool(j.relay),
    odometer: toNumber(j.odometer),
    lastPlace: toString_(j.last_place),
    lastTime: toDate(j.last_time),
    stime: toDate(j.stime),
  };
}

export function parseVehicleCounts(j: Record<string, unknown>): VehicleCounts {
  return {
    all: toInt(j.all),
    running: toInt(j.running),
    stop: toInt(j.stop),
    idle: toInt(j.idle),
    overspeed: toInt(j.overspeed),
    inactive: toInt(j.inactive),
    nodata: toInt(j.nodata),
  };
}

export function parseVehicleListResponse(
  j: Record<string, unknown>,
): VehicleListResponse {
  return {
    vehicles: ((j.vehicles as unknown[]) ?? []).map((e) =>
      parseVehicle(e as Record<string, unknown>),
    ),
    counts: parseVehicleCounts(
      ((j.counts as Record<string, unknown>) ?? {}) as Record<string, unknown>,
    ),
  };
}

export function parseVehicleDetail(j: Record<string, unknown>): VehicleDetail {
  return {
    vehId: toInt(j.veh_id),
    regNo: toString_(j.reg_no),
    name: toString_(j.name),
    type: toString_(j.type),
    overspeed: toNumber(j.ospeed),
    odometer: toNumber(j.odometer),
    mileage: toNumber(j.milage),
    lowFuel: toInt(j.low_fuel),
  };
}
