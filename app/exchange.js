import { nanoid } from "nanoid";

import * as repo from "./repositories/stateRepository.js";

export async function init() {
  await repo.init();
}

export async function getAccounts() {
  return await repo.getAccounts();
}

export async function setAccountBalance(accountId, balance) {
  await repo.setAccountBalance(accountId, balance);
}

export async function getRates() {
  return await repo.getRates();
}

export async function getLog() {
  return await repo.getLog();
}

export async function setRate(rateRequest) {
  await repo.setRate(rateRequest);
}

export async function exchange(exchangeRequest) {
  const {
    baseCurrency,
    counterCurrency,
    baseAccountId: clientBaseAccountId,
    counterAccountId: clientCounterAccountId,
    baseAmount,
  } = exchangeRequest;

  const exchangeRate = await repo.getRate(baseCurrency, counterCurrency);
  const counterAmount = baseAmount * exchangeRate;
  const baseAccount = await repo.getAccountByCurrency(baseCurrency);
  const counterAccount = await repo.getAccountByCurrency(counterCurrency);

  const exchangeResult = {
    id: nanoid(),
    ts: new Date(),
    ok: false,
    request: exchangeRequest,
    exchangeRate: exchangeRate,
    counterAmount: 0.0,
    obs: null,
  };

  if (counterAccount.balance >= counterAmount) {
    if (await transfer(clientBaseAccountId, baseAccount.id, baseAmount)) {
      if (
        await transfer(counterAccount.id, clientCounterAccountId, counterAmount)
      ) {
        await repo.updateAccountBalanceDelta(baseAccount.id, baseAmount);
        await repo.updateAccountBalanceDelta(counterAccount.id, -counterAmount);
        exchangeResult.ok = true;
        exchangeResult.counterAmount = counterAmount;
      } else {
        await transfer(baseAccount.id, clientBaseAccountId, baseAmount);
        exchangeResult.obs = "Could not transfer to clients' account";
      }
    } else {
      exchangeResult.obs = "Could not withdraw from clients' account";
    }
  } else {
    exchangeResult.obs = "Not enough funds on counter currency account";
  }

  await repo.appendLog(exchangeResult);

  return exchangeResult;
}

async function transfer(fromAccountId, toAccountId, amount) {
  const min = 200;
  const max = 400;
  return new Promise((resolve) =>
    setTimeout(() => resolve(true), Math.random() * (max - min + 1) + min)
  );
}
