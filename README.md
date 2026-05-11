# neptrack_nodejs

Node.js SDK for the [NepTrack](https://neptrack.com) GPS tracking platform — REST API + real-time Data Stream.

Written in TypeScript, ships ESM + CommonJS builds with type definitions.

> Manage tokens on the [NepTrack dashboard](https://neptrack.com) → **API Integration → API Tokens**.

## Install

```bash
npm install neptrack_nodejs
```

Requires Node.js **>= 18** (native `fetch` / `AbortController`).

## Authentication

Generate an API token from the dashboard under **API Integration → API Tokens**. Each token has scopes; calls that require a scope your token doesn't have will throw `NeptrackScopeException`.

## Quick start

```ts
import { NeptrackClient } from 'neptrack_nodejs';

const client = new NeptrackClient({ token: 'npt_...' });

const { vehicles } = await client.listVehicles();
for (const v of vehicles) {
  console.log(`${v.regNo}  ${v.status}  ${v.speed} km/h`);
}
```

## REST endpoints

| Method                          | Endpoint                          | Required scope    |
|---------------------------------|-----------------------------------|-------------------|
| `listVehicles()`                | `GET  /vehicles`                  | `vehicles`        |
| `vehicleDetail(id)`             | `GET  /vehicles/{id}`             | `vehicle_details` |
| `vehicleHistory(id, …)`         | `GET  /vehicles/{id}/history`     | `history`         |
| `vehicleReport(id, …)`          | `GET  /vehicles/{id}/report`      | `reports`         |
| `listAlarms(…)`                 | `GET  /alarms`                    | `alarms`          |
| `listMotionLogs(…)`             | `GET  /motion-logs`               | `motion_logs`     |
| `listGeofences(…)`              | `GET  /geofences`                 | `geofence`        |
| `sendCommand(id, action)`       | `POST /vehicles/{id}/command`     | `command`         |

## Real-time Data Stream

`NeptrackStreamClient` is a Socket.IO v2 client for live `position`, `alarm`,
and `motion` events. Token must include the **`live_stream`** scope.

```ts
import { NeptrackStreamClient } from 'neptrack_nodejs';

const stream = new NeptrackStreamClient({
  url:   'wss://...',  // ask NepTrack support for your stream endpoint
  token: 'npt_...',
});

stream.on('position', p => {
  console.log(`${p.imei}  ${p.latitude},${p.longitude}  ${p.speedKmh.toFixed(1)} km/h`);
});
stream.on('alarm',  a => console.warn('ALARM', a.imei, a.alarms));
stream.on('motion', m => console.log('MOTION', m.imei, m.motionStatus));
stream.on('error',  e => {
  if (e.unauthorized) console.error('Token invalid / missing live_stream scope');
});

stream.connect();
stream.subscribe('355000000000001');     // by IMEI
// or: stream.subscribeAll(['355...', '355...']);

// later:
stream.close();
```

Server-side: up to **5 concurrent streams per vehicle**, Socket.IO **v2 only**
(v3/v4 clients are not compatible — that's why this SDK depends on
`socket.io-client@^2.4.0`).

## Error handling

All REST errors derive from `NeptrackException`:

| Exception                       | Cause                                     |
|---------------------------------|-------------------------------------------|
| `NeptrackAuthException` (401)   | Missing / invalid / revoked token         |
| `NeptrackScopeException` (403)  | Token lacks the scope for this endpoint   |
| `NeptrackRateLimitException`    | Too many failed auth attempts             |
| `NeptrackApiException`          | Endpoint returned `err: true`             |
| `NeptrackException`             | Anything else (network, 5xx, etc.)        |

```ts
try {
  await client.listVehicles();
} catch (e) {
  if (e instanceof NeptrackAuthException) {
    // re-prompt for token
  } else if (e instanceof NeptrackException) {
    console.error('Failed:', e.message);
  } else {
    throw e;
  }
}
```

Stream-side errors arrive on the `error` event as `StreamError` objects
(`unauthorized: true` indicates token / scope issues).

## Engine command

`sendCommand` cuts or restores engine power via the device relay. **This is a physical action — never call `'stop'` while the vehicle is in motion.**

```ts
await client.sendCommand(vehId, 'stop');
await client.sendCommand(vehId, 'restore');
```

## Resources

- Website & dashboard — [neptrack.com](https://neptrack.com)
- Issues — [github.com/NepTrack/neptrack_nodejs/issues](https://github.com/NepTrack/neptrack_nodejs/issues)

## License

Apache-2.0 — see [LICENSE](LICENSE). © NepTrack.
