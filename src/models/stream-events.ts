import {
  VehicleStatus,
  parseVehicleStatus,
  toBool,
  toDate,
  toInt,
  toNumber,
  toString_,
} from './common';

/** Real-time `position` event from the Data Stream API. */
export interface PositionEvent {
  imei: string;
  valid: boolean;
  latitude: number;
  longitude: number;
  /** Speed in **knots** — multiply by 1.852 for km/h. */
  speed: number;
  /** Convenience: speed in km/h. */
  speedKmh: number;
  /** Heading in degrees (0–360). */
  course: number;
  altitude: number;
  motionStatus: VehicleStatus;
  lastPlace: string;
  /** GSM signal strength 0–5. */
  gsmSignal: number;
  fixTime: Date | null;
  deviceTime: Date | null;
  alarms: string[];
  attributes: PositionAttributes;
  /** Original payload — kept for forward compatibility. */
  raw: Record<string, unknown>;
}

export interface PositionAttributes {
  ignition: boolean;
  charge: boolean;
  batteryLevel: number;
  blocked: boolean;
  satellites: number;
  serverTime: Date | null;
}

export interface AlarmEvent {
  imei: string;
  alarms: string[];
  eventTime: Date | null;
  raw: Record<string, unknown>;
}

export interface MotionEvent {
  imei: string;
  motionStatus: VehicleStatus;
  eventTime: Date | null;
  raw: Record<string, unknown>;
}

export function parsePositionAttributes(
  j: Record<string, unknown>,
): PositionAttributes {
  return {
    ignition: toBool(j.ignition),
    charge: toBool(j.charge),
    batteryLevel: toInt(j.batteryLevel),
    blocked: toBool(j.blocked),
    satellites: toInt(j.satellites),
    serverTime: toDate(j.serverTime),
  };
}

export function parsePositionEvent(
  j: Record<string, unknown>,
): PositionEvent {
  const speed = toNumber(j.speed);
  return {
    imei: toString_(j.imei),
    valid: toBool(j.valid),
    latitude: toNumber(j.latitude),
    longitude: toNumber(j.longitude),
    speed,
    speedKmh: speed * 1.852,
    course: toNumber(j.course),
    altitude: toNumber(j.altitude),
    motionStatus: parseVehicleStatus(j.motionStatus),
    lastPlace: toString_(j.lastPlace),
    gsmSignal: toInt(j.gsmSignal),
    fixTime: toDate(j.fixTime),
    deviceTime: toDate(j.deviceTime),
    alarms: ((j.alarms as unknown[]) ?? []).map((e) => String(e)),
    attributes: parsePositionAttributes(
      (j.attributes as Record<string, unknown>) ?? {},
    ),
    raw: j,
  };
}

export function parseAlarmEvent(j: Record<string, unknown>): AlarmEvent {
  return {
    imei: toString_(j.imei),
    alarms: ((j.alarms as unknown[]) ?? []).map((e) => String(e)),
    eventTime: toDate(j.fixTime ?? j.deviceTime ?? j.serverTime),
    raw: j,
  };
}

export function parseMotionEvent(j: Record<string, unknown>): MotionEvent {
  return {
    imei: toString_(j.imei),
    motionStatus: parseVehicleStatus(j.motionStatus),
    eventTime: toDate(j.fixTime ?? j.deviceTime ?? j.serverTime),
    raw: j,
  };
}
