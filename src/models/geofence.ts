import { toBool, toInt, toNumber, toString_ } from './common';

export type GeofenceType = 'radius' | 'polygon' | 'unknown';

export function parseGeofenceType(s: unknown): GeofenceType {
  return s === 'radius' || s === 'polygon' ? s : 'unknown';
}

export interface Geofence {
  geofenceId: number;
  name: string;
  type: GeofenceType;
  lat: number;
  lng: number;
  /** Metres — null for polygons. */
  radius: number | null;
  alertEntry: boolean;
  alertExit: boolean;
  alertMedium: string[];
  vehIds: number[];
  vehCount: number;
}

export interface GeofencesResponse {
  total: number;
  page: number;
  perPage: number;
  geofences: Geofence[];
}

export function parseGeofence(j: Record<string, unknown>): Geofence {
  const r = j.radius;
  return {
    geofenceId: toInt(j.geofence_id),
    name: toString_(j.name),
    type: parseGeofenceType(j.type),
    lat: toNumber(j.lat),
    lng: toNumber(j.lng),
    radius: r == null ? null : toInt(r),
    alertEntry: toBool(j.alert_entry),
    alertExit: toBool(j.alert_exit),
    alertMedium: ((j.alert_medium as unknown[]) ?? []).map((e) => String(e)),
    vehIds: ((j.veh_ids as unknown[]) ?? []).map((e) => toInt(e)),
    vehCount: toInt(j.veh_count),
  };
}

export function parseGeofencesResponse(
  j: Record<string, unknown>,
): GeofencesResponse {
  return {
    total: toInt(j.total),
    page: toInt(j.page, 1),
    perPage: toInt(j.per_page, 50),
    geofences: ((j.geofences as unknown[]) ?? []).map((e) =>
      parseGeofence(e as Record<string, unknown>),
    ),
  };
}
