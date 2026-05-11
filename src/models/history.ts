import {
  VehicleStatus,
  parseVehicleStatus,
  toInt,
  toNumber,
} from './common';

export interface HistoryPoint {
  lat: number;
  lng: number;
  speed: number;
  time: Date;
  status: VehicleStatus;
}

export interface Trip {
  lat1: number;
  lng1: number;
  lat2: number;
  lng2: number;
  time1: Date;
  time2: Date;
  placeId1: number | null;
  placeId2: number | null;
  /** km */
  distance: number;
  /** milliseconds */
  durationMs: number;
  maxSpeed: number;
  avgSpeed: number;
}

export interface StopEvent {
  lat: number;
  lng: number;
  placeId: number | null;
  time1: Date;
  time2: Date;
  /** milliseconds */
  durationMs: number;
}

export interface HistoryResponse {
  /** Vehicle's configured overspeed threshold (km/h). */
  overspeedThreshold: number;
  points: HistoryPoint[];
  trips: Trip[];
  stops: StopEvent[];
  places: Map<number, string>;
}

export function parseHistoryPoint(j: Record<string, unknown>): HistoryPoint {
  return {
    lat: toNumber(j.lat),
    lng: toNumber(j.lng),
    speed: toNumber(j.speed),
    time: new Date(toInt(j.time_ms)),
    status: parseVehicleStatus(j.status),
  };
}

export function parseTrip(j: Record<string, unknown>): Trip {
  return {
    lat1: toNumber(j.lat1),
    lng1: toNumber(j.lng1),
    lat2: toNumber(j.lat2),
    lng2: toNumber(j.lng2),
    time1: new Date(toInt(j.time1)),
    time2: new Date(toInt(j.time2)),
    placeId1: j.place_id1 == null ? null : toInt(j.place_id1),
    placeId2: j.place_id2 == null ? null : toInt(j.place_id2),
    distance: toNumber(j.distance),
    durationMs: toInt(j.duration),
    maxSpeed: toNumber(j.max_speed),
    avgSpeed: toNumber(j.avg_speed),
  };
}

export function parseStopEvent(j: Record<string, unknown>): StopEvent {
  return {
    lat: toNumber(j.lat),
    lng: toNumber(j.lng),
    placeId: j.place_id == null ? null : toInt(j.place_id),
    time1: new Date(toInt(j.time1)),
    time2: new Date(toInt(j.time2)),
    durationMs: toInt(j.duration),
  };
}

export function parseHistoryResponse(
  j: Record<string, unknown>,
): HistoryResponse {
  const places = new Map<number, string>();
  const rawPlaces = (j.places as Record<string, unknown>) ?? {};
  for (const [k, v] of Object.entries(rawPlaces)) {
    const id = parseInt(k, 10);
    if (Number.isFinite(id)) places.set(id, String(v));
  }
  return {
    overspeedThreshold: toNumber(j.overspeed),
    points: ((j.points as unknown[]) ?? []).map((e) =>
      parseHistoryPoint(e as Record<string, unknown>),
    ),
    trips: ((j.trips as unknown[]) ?? []).map((e) =>
      parseTrip(e as Record<string, unknown>),
    ),
    stops: ((j.stops as unknown[]) ?? []).map((e) =>
      parseStopEvent(e as Record<string, unknown>),
    ),
    places,
  };
}
