import { EventEmitter } from 'events';
import io from 'socket.io-client';

import {
  AlarmEvent,
  MotionEvent,
  PositionEvent,
  parseAlarmEvent,
  parseMotionEvent,
  parsePositionEvent,
} from './models/stream-events';

export interface StreamError {
  message: string;
  unauthorized: boolean;
}

export interface NeptrackStreamClientOptions {
  /** WebSocket URL (e.g. `wss://your-host`). Required. */
  url: string;
  /** API token — must include the `live_stream` scope. */
  token: string;
  /** Restrict to `websocket` only (no long-polling fallback). Default: true. */
  websocketOnly?: boolean;
}

export interface NeptrackStreamClient {
  on(event: 'position', listener: (e: PositionEvent) => void): this;
  on(event: 'alarm', listener: (e: AlarmEvent) => void): this;
  on(event: 'motion', listener: (e: MotionEvent) => void): this;
  on(event: 'error', listener: (e: StreamError) => void): this;
  on(event: 'connect', listener: () => void): this;
  on(event: 'disconnect', listener: (reason: string | null) => void): this;
  on(event: string, listener: (...args: any[]) => void): this;

  off(event: string, listener: (...args: any[]) => void): this;
  once(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
}

/**
 * NepTrack Data Stream API client — Socket.IO v2.
 *
 * Token must include the **`live_stream`** scope. Up to 5 concurrent streams
 * per vehicle. Server is pinned to Socket.IO v2, so this SDK depends on
 * `socket.io-client@^2.4.0` (v3/v4 clients are not compatible).
 *
 * Usage:
 * ```ts
 * const stream = new NeptrackStreamClient({
 *   url: 'wss://...',
 *   token: 'npt_...',
 * });
 *
 * stream.on('position', p => console.log(p.imei, p.speedKmh));
 * stream.on('alarm',    a => console.warn('ALARM', a));
 * stream.on('motion',   m => console.log('MOTION', m));
 * stream.on('error',    e => { if (e.unauthorized) console.error('bad token'); });
 *
 * stream.connect();
 * stream.subscribe('355000000000001');
 * // later: stream.close();
 * ```
 */
export class NeptrackStreamClient extends EventEmitter {
  readonly url: string;
  readonly token: string;
  readonly websocketOnly: boolean;

  private readonly _socket: SocketIOClient.Socket;
  private readonly _subscriptions = new Set<string>();
  private _closed = false;

  constructor(opts: NeptrackStreamClientOptions) {
    super();
    if (!opts.url) throw new Error('NeptrackStreamClient: url is required');
    if (!opts.token) throw new Error('NeptrackStreamClient: token is required');
    this.url = opts.url;
    this.token = opts.token;
    this.websocketOnly = opts.websocketOnly ?? true;

    this._socket = io(this.url, {
      autoConnect: false,
      transports: this.websocketOnly ? ['websocket'] : ['websocket', 'polling'],
      query: { token: this.token },
    });

    this._wire();
  }

  /** IMEIs currently subscribed (locally tracked). */
  get subscriptions(): ReadonlySet<string> {
    return this._subscriptions;
  }

  /** Whether the socket is currently connected. */
  get connected(): boolean {
    return this._socket.connected;
  }

  /** Open the connection. Re-subscribes on every (re)connect. */
  connect(): void {
    if (this._closed) {
      throw new Error('NeptrackStreamClient has been closed.');
    }
    this._socket.connect();
  }

  /**
   * Subscribe to a single vehicle by IMEI. Safe to call before `connect()`;
   * the subscription is replayed once the connection is established.
   */
  subscribe(imei: string): void {
    this._subscriptions.add(imei);
    if (this._socket.connected) this._socket.emit('subscribe', imei);
  }

  /** Subscribe to multiple IMEIs. */
  subscribeAll(imeis: Iterable<string>): void {
    for (const i of imeis) this.subscribe(i);
  }

  /** Disconnect and release resources. The instance cannot be reused. */
  close(): void {
    if (this._closed) return;
    this._closed = true;
    this._socket.disconnect();
    this._socket.removeAllListeners();
    this.removeAllListeners();
  }

  private _wire(): void {
    this._socket.on('connect', () => {
      for (const imei of this._subscriptions) {
        this._socket.emit('subscribe', imei);
      }
      this.emit('connect');
    });

    this._socket.on('position', (data: unknown) => {
      const j = this._toObj(data);
      if (j) this.emit('position', parsePositionEvent(j));
    });
    this._socket.on('alarm', (data: unknown) => {
      const j = this._toObj(data);
      if (j) this.emit('alarm', parseAlarmEvent(j));
    });
    this._socket.on('motion', (data: unknown) => {
      const j = this._toObj(data);
      if (j) this.emit('motion', parseMotionEvent(j));
    });

    this._socket.on('connect_error', (err: Error) => {
      const msg = err?.message ?? 'connect_error';
      this.emit('error', {
        message: msg,
        unauthorized: msg.includes('Unauthorized'),
      } satisfies StreamError);
    });
    this._socket.on('error', (err: unknown) => {
      this.emit('error', {
        message: err instanceof Error ? err.message : String(err),
        unauthorized: false,
      } satisfies StreamError);
    });
    this._socket.on('disconnect', (reason: string) => {
      this.emit('disconnect', reason ?? null);
    });
  }

  private _toObj(data: unknown): Record<string, unknown> | null {
    try {
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return data as Record<string, unknown>;
      }
      if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      }
    } catch (e) {
      this.emit('error', {
        message: `decode error: ${(e as Error).message}`,
        unauthorized: false,
      } satisfies StreamError);
    }
    return null;
  }
}
