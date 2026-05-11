import { NeptrackClient, NeptrackStreamClient } from '../src';

async function main() {
  const token = process.env.NEPTRACK_TOKEN;
  if (!token) throw new Error('Set NEPTRACK_TOKEN');

  const client = new NeptrackClient({ token });
  const { vehicles, counts } = await client.listVehicles();
  console.log(`Total: ${counts.all}  Running: ${counts.running}`);
  for (const v of vehicles.slice(0, 5)) {
    console.log(`  ${v.regNo.padEnd(12)}  ${v.status.padEnd(9)}  ${v.speed} km/h`);
  }

  const wsUrl = process.env.NEPTRACK_WS_URL;
  const imei = process.env.NEPTRACK_IMEI;
  if (!wsUrl || !imei) return;

  const stream = new NeptrackStreamClient({ url: wsUrl, token });
  stream.on('position', p =>
    console.log(`${p.imei}  ${p.latitude},${p.longitude}  ${p.speedKmh.toFixed(1)} km/h`),
  );
  stream.on('error', e =>
    console.error(e.unauthorized ? 'Bad token / scope' : e.message),
  );
  stream.connect();
  stream.subscribe(imei);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
