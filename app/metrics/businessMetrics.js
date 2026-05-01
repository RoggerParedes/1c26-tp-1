import dgram from "node:dgram";

const statsdHost = process.env.STATSD_HOST ?? "graphite";
const statsdPort = Number(process.env.STATSD_PORT ?? 8125);
const socket = dgram.createSocket("udp4");

const volumeTotalsByCurrency = new Map();
const netTotalsByCurrency = new Map();

export function recordSuccessfulExchangeMetrics({
  baseCurrency,
  counterCurrency,
  baseAmount,
  counterAmount,
}) {
  const safeBaseCurrency = normalizeCurrency(baseCurrency);
  const safeCounterCurrency = normalizeCurrency(counterCurrency);
  const safeBaseAmount = toFiniteNumber(baseAmount);
  const safeCounterAmount = toFiniteNumber(counterAmount);

  if (!safeBaseCurrency || !safeCounterCurrency) {
    return;
  }

  if (safeBaseAmount <= 0 || safeCounterAmount <= 0) {
    return;
  }

  updateVolumeAndNet(safeBaseCurrency, safeBaseAmount, safeBaseAmount);
  updateVolumeAndNet(safeCounterCurrency, safeCounterAmount, -safeCounterAmount);
}

function updateVolumeAndNet(currency, volumeDelta, netDelta) {
  const currentVolume = volumeTotalsByCurrency.get(currency) ?? 0;
  const currentNet = netTotalsByCurrency.get(currency) ?? 0;

  const nextVolume = currentVolume + volumeDelta;
  const nextNet = currentNet + netDelta;

  volumeTotalsByCurrency.set(currency, nextVolume);
  netTotalsByCurrency.set(currency, nextNet);

  sendGauge(`exchange.business.volume.${currency}`, nextVolume);
  sendGauge(`exchange.business.net.${currency}`, nextNet);
}

function sendGauge(metricName, value) {
  const payload = Buffer.from(`${metricName}:${value}|g`);
  socket.send(payload, statsdPort, statsdHost, () => {});
}

function normalizeCurrency(currency) {
  if (typeof currency !== "string") {
    return null;
  }

  const normalized = currency.trim().toLowerCase();
  return normalized.replace(/[^a-z0-9_]/g, "");
}

function toFiniteNumber(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return numericValue;
}
