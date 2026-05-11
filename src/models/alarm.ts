import { toInt, toString_ } from './common';

export interface Alarm {
  alarmId: number;
  type: string;
  title: string;
  regNo: string;
  message: string;
  timeAgo: string;
  receivedFmt: string;
  iconStatus: string;
  iconImage: string;
}

export interface AlarmsResponse {
  total: number;
  page: number;
  perPage: number;
  alarms: Alarm[];
}

export function parseAlarm(j: Record<string, unknown>): Alarm {
  return {
    alarmId: toInt(j.alarm_id),
    type: toString_(j.type),
    title: toString_(j.title),
    regNo: toString_(j.reg_no),
    message: toString_(j.message),
    timeAgo: toString_(j.time_ago),
    receivedFmt: toString_(j.received_fmt),
    iconStatus: toString_(j.icon_status),
    iconImage: toString_(j.icon_image),
  };
}

export function parseAlarmsResponse(
  j: Record<string, unknown>,
): AlarmsResponse {
  return {
    total: toInt(j.total),
    page: toInt(j.page, 1),
    perPage: toInt(j.per_page, 50),
    alarms: ((j.alarms as unknown[]) ?? []).map((e) =>
      parseAlarm(e as Record<string, unknown>),
    ),
  };
}
