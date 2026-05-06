import { createClient } from "redis";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_DIR = path.join(__dirname, "..", "state");
const ACCOUNTS_IDS = "accounts:ids";
const RATES_BASES = "rates:bases";
const LOG_KEY = "log";

const accountKey = (id) => `account:${id}`;
const ratesKey = (base) => `rates:${base}`;

let client;

export async function init() {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  client = createClient({ url });
  client.on("error", (err) => console.error("Redis client error:", err));
  await client.connect();

  const seeded = await client.sCard(ACCOUNTS_IDS);
  if (seeded === 0) {
    await seed();
  }
}

async function seed() {
  const accounts = JSON.parse(
    await fs.promises.readFile(path.join(SEED_DIR, "accounts.json"), "utf8")
  );
  const rates = JSON.parse(
    await fs.promises.readFile(path.join(SEED_DIR, "rates.json"), "utf8")
  );
  const log = JSON.parse(
    await fs.promises.readFile(path.join(SEED_DIR, "log.json"), "utf8")
  );

  const tx = client.multi();

  for (const acc of accounts) {
    tx.hSet(accountKey(acc.id), {
      id: String(acc.id),
      currency: acc.currency,
      balance: String(acc.balance),
    });
    tx.sAdd(ACCOUNTS_IDS, String(acc.id));
  }

  for (const [base, counters] of Object.entries(rates)) {
    tx.sAdd(RATES_BASES, base);
    for (const [counter, rate] of Object.entries(counters)) {
      tx.hSet(ratesKey(base), counter, String(rate));
    }
  }

  if (Array.isArray(log) && log.length > 0) {
    tx.rPush(LOG_KEY, log.map((entry) => JSON.stringify(entry)));
  }

  await tx.exec();
}

function parseAccount(hash) {
  if (!hash || Object.keys(hash).length === 0) return null;
  return {
    id: Number(hash.id),
    currency: hash.currency,
    balance: Number(hash.balance),
  };
}

export async function getAccounts() {
  const ids = await client.sMembers(ACCOUNTS_IDS);
  if (ids.length === 0) return [];
  const tx = client.multi();
  for (const id of ids) tx.hGetAll(accountKey(id));
  const results = await tx.exec();
  return results
    .map(parseAccount)
    .filter((a) => a !== null)
    .sort((a, b) => a.id - b.id);
}

export async function getAccountById(id) {
  const hash = await client.hGetAll(accountKey(id));
  return parseAccount(hash);
}

export async function getAccountByCurrency(currency) {
  const accounts = await getAccounts();
  return accounts.find((a) => a.currency === currency) ?? null;
}

export async function setAccountBalance(id, balance) {
  await client.hSet(accountKey(id), "balance", String(balance));
}

export async function updateAccountBalanceDelta(id, delta) {
  return await client.hIncrByFloat(accountKey(id), "balance", delta);
}

export async function getRates() {
  const bases = await client.sMembers(RATES_BASES);
  const out = {};
  if (bases.length === 0) return out;
  const tx = client.multi();
  for (const base of bases) tx.hGetAll(ratesKey(base));
  const results = await tx.exec();
  bases.forEach((base, i) => {
    const entries = results[i] ?? {};
    const parsed = {};
    for (const [counter, rate] of Object.entries(entries)) {
      parsed[counter] = Number(rate);
    }
    out[base] = parsed;
  });
  return out;
}

export async function getRate(base, counter) {
  const v = await client.hGet(ratesKey(base), counter);
  return v == null ? null : Number(v);
}

export async function setRate({ baseCurrency, counterCurrency, rate }) {
  const reciprocal = Number((1 / rate).toFixed(5));
  const tx = client.multi();
  tx.sAdd(RATES_BASES, baseCurrency);
  tx.sAdd(RATES_BASES, counterCurrency);
  tx.hSet(ratesKey(baseCurrency), counterCurrency, String(rate));
  tx.hSet(ratesKey(counterCurrency), baseCurrency, String(reciprocal));
  await tx.exec();
}

export async function getLog() {
  const entries = await client.lRange(LOG_KEY, 0, -1);
  return entries.map((e) => JSON.parse(e));
}

export async function appendLog(entry) {
  await client.rPush(LOG_KEY, JSON.stringify(entry));
}
