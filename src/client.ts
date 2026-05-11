import {
  NeptrackApiException,
  NeptrackAuthException,
  NeptrackException,
  NeptrackRateLimitException,
  NeptrackScopeException,
} from './exceptions';
import {
  AlarmsResponse,
  parseAlarmsResponse,
} from './models/alarm';
import {
  CommandResult,
  EngineAction,
  parseCommandResult,
} from './models/command';
import { ymd } from './models/common';
import {
  GeofenceType,
  GeofencesResponse,
  parseGeofencesResponse,
} from './models/geofence';
import {
  HistoryResponse,
  parseHistoryResponse,
} from './models/history';
import {
  MotionLogsResponse,
  parseMotionLogsResponse,
} from './models/motion-log';
import {
  ReportResponse,
  parseReportResponse,
} from './models/report';
import {
  VehicleDetail,
  VehicleListResponse,
  parseVehicleDetail,
  parseVehicleListResponse,
} from './models/vehicle';

export interface NeptrackClientOptions {
  /** API token (the `Bearer ...` value). */
  token: string;
  /** Base URL of the REST API — no trailing slash. */
  baseUrl?: string;
  /** Request timeout in milliseconds (default 30 000). */
  timeoutMs?: number;
  /** Inject a custom `fetch` (default: global `fetch`). */
  fetch?: typeof fetch;
}

/**
 * NepTrack REST API client.
 *
 * Authenticate by passing your API token (created on the NepTrack
 * dashboard → API Integration → API Tokens). Every call sends the
 * token as `Authorization: Bearer <token>`.
 */
export class NeptrackClient {
  static readonly defaultBaseUrl = 'https://sys.neptrack.com/rest/v1';

  readonly baseUrl: string;
  readonly token: string;
  readonly timeoutMs: number;
  private readonly _fetch: typeof fetch;

  constructor(opts: NeptrackClientOptions) {
    if (!opts.token) throw new Error('NeptrackClient: token is required');
    this.token = opts.token;
    this.baseUrl = (opts.baseUrl ?? NeptrackClient.defaultBaseUrl).replace(
      /\/$/,
      '',
    );
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    this._fetch = opts.fetch ?? fetch;
  }

  // ── Vehicles ─────────────────────────────────────────────────────────────

  /** `GET /vehicles` — all vehicles with live status. Scope: **vehicles**. */
  async listVehicles(): Promise<VehicleListResponse> {
    return parseVehicleListResponse(await this._get('/vehicles'));
  }

  /** `GET /vehicles/{veh_id}`. Scope: **vehicle_details**. */
  async vehicleDetail(vehId: number): Promise<VehicleDetail> {
    return parseVehicleDetail(await this._get(`/vehicles/${vehId}`));
  }

  // ── History ──────────────────────────────────────────────────────────────

  /** `GET /vehicles/{veh_id}/history`. Scope: **history**. */
  async vehicleHistory(
    vehId: number,
    opts: { startDate?: Date; endDate?: Date } = {},
  ): Promise<HistoryResponse> {
    return parseHistoryResponse(
      await this._get(`/vehicles/${vehId}/history`, {
        ...(opts.startDate ? { sdate: ymd(opts.startDate) } : {}),
        ...(opts.endDate ? { edate: ymd(opts.endDate) } : {}),
      }),
    );
  }

  // ── Reports ──────────────────────────────────────────────────────────────

  /** `GET /vehicles/{veh_id}/report` — per-day stats, max 31 days. Scope: **reports**. */
  async vehicleReport(
    vehId: number,
    opts: { startDate?: Date; endDate?: Date } = {},
  ): Promise<ReportResponse> {
    return parseReportResponse(
      await this._get(`/vehicles/${vehId}/report`, {
        ...(opts.startDate ? { start_date: ymd(opts.startDate) } : {}),
        ...(opts.endDate ? { end_date: ymd(opts.endDate) } : {}),
      }),
    );
  }

  // ── Alarms ───────────────────────────────────────────────────────────────

  /** `GET /alarms` — paginated alarm events (50 per page). Scope: **alarms**. */
  async listAlarms(
    opts: { vehId?: number; date?: Date; page?: number } = {},
  ): Promise<AlarmsResponse> {
    return parseAlarmsResponse(
      await this._get('/alarms', {
        ...(opts.vehId != null ? { veh_id: String(opts.vehId) } : {}),
        ...(opts.date ? { fdate: ymd(opts.date) } : {}),
        page: String(opts.page ?? 1),
      }),
    );
  }

  // ── Motion logs ──────────────────────────────────────────────────────────

  /** `GET /motion-logs` — paginated motion status changes (50 per page). Scope: **motion_logs**. */
  async listMotionLogs(
    opts: {
      vehId?: number;
      toStatus?: string;
      date?: Date;
      page?: number;
    } = {},
  ): Promise<MotionLogsResponse> {
    return parseMotionLogsResponse(
      await this._get('/motion-logs', {
        ...(opts.vehId != null ? { veh_id: String(opts.vehId) } : {}),
        ...(opts.toStatus ? { fto: opts.toStatus } : {}),
        ...(opts.date ? { fdate: ymd(opts.date) } : {}),
        page: String(opts.page ?? 1),
      }),
    );
  }

  // ── Geofences ────────────────────────────────────────────────────────────

  /** `GET /geofences` — paginated geofences (50 per page). Scope: **geofence**. */
  async listGeofences(
    opts: {
      vehId?: number;
      search?: string;
      type?: GeofenceType;
      page?: number;
    } = {},
  ): Promise<GeofencesResponse> {
    return parseGeofencesResponse(
      await this._get('/geofences', {
        ...(opts.vehId != null ? { veh_id: String(opts.vehId) } : {}),
        ...(opts.search ? { search: opts.search } : {}),
        ...(opts.type && opts.type !== 'unknown' ? { ftype: opts.type } : {}),
        page: String(opts.page ?? 1),
      }),
    );
  }

  // ── Commands ─────────────────────────────────────────────────────────────

  /**
   * `POST /vehicles/{veh_id}/command` — cut or restore engine power.
   * Scope: **command**.
   *
   * **Destructive.** Ensure the vehicle is safely parked before stopping.
   */
  async sendCommand(
    vehId: number,
    action: EngineAction,
  ): Promise<CommandResult> {
    return parseCommandResult(
      await this._post(`/vehicles/${vehId}/command`, { action }),
    );
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  private _headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/json',
    };
  }

  private _url(path: string, query?: Record<string, string>): string {
    const u = new URL(`${this.baseUrl}${path}`);
    if (query) for (const [k, v] of Object.entries(query)) u.searchParams.set(k, v);
    return u.toString();
  }

  private async _get(
    path: string,
    query?: Record<string, string>,
  ): Promise<Record<string, unknown>> {
    return this._request('GET', this._url(path, query));
  }

  private async _post(
    path: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this._request('POST', this._url(path), body);
  }

  private async _request(
    method: 'GET' | 'POST',
    url: string,
    body?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await this._fetch(url, {
        method,
        headers: {
          ...this._headers(),
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      });
      return this._decode(res);
    } finally {
      clearTimeout(timer);
    }
  }

  private async _decode(res: Response): Promise<Record<string, unknown>> {
    const status = res.status;
    let body: Record<string, unknown> | null = null;
    let text = '';
    try {
      text = await res.text();
      const parsed = text ? JSON.parse(text) : null;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        body = parsed as Record<string, unknown>;
      }
    } catch {
      // body left null
    }
    const msg = (body?.msg as string | undefined) ?? `HTTP ${status}`;

    if (status === 401) throw new NeptrackAuthException(msg);
    if (status === 403) throw new NeptrackScopeException(msg);
    if (status === 429) throw new NeptrackRateLimitException(msg);
    if (status < 200 || status >= 300 || body == null) {
      throw new NeptrackException(msg, { statusCode: status });
    }
    if (body.err === true) throw new NeptrackApiException(msg);
    return body;
  }
}
