import express from "express";

import {
  getAccounts,
  setAccountBalance,
  getRates,
  setRate,
  getLog,
  exchange,
} from "../exchange.js";

const router = express.Router();

// ACCOUNT endpoints
router.get("/accounts", async (req, res) => {
  res.json(await getAccounts());
});

router.put("/accounts/:id/balance", async (req, res) => {
  const accountId = req.params.id;
  const { balance } = req.body;

  if (!accountId || !balance) {
    return res.status(400).json({ error: "Malformed request" });
  } else {
    await setAccountBalance(accountId, balance);

    res.json(await getAccounts());
  }
});

// RATE endpoints
router.get("/rates", async (req, res) => {
  res.json(await getRates());
});

router.put("/rates", async (req, res) => {
  const { baseCurrency, counterCurrency, rate } = req.body;

  if (!baseCurrency || !counterCurrency || !rate) {
    return res.status(400).json({ error: "Malformed request" });
  }

  const newRateRequest = { ...req.body };
  await setRate(newRateRequest);

  res.json(await getRates());
});

// LOG endpoint
router.get("/log", async (req, res) => {
  res.json(await getLog());
});

// EXCHANGE endpoint
router.post("/exchange", async (req, res) => {
  const {
    baseCurrency,
    counterCurrency,
    baseAccountId,
    counterAccountId,
    baseAmount,
  } = req.body;

  if (
    !baseCurrency ||
    !counterCurrency ||
    !baseAccountId ||
    !counterAccountId ||
    !baseAmount
  ) {
    return res.status(400).json({ error: "Malformed request" });
  }

  const exchangeRequest = { ...req.body };
  const exchangeResult = await exchange(exchangeRequest);

  if (exchangeResult.ok) {
    res.status(200).json(exchangeResult);
  } else {
    res.status(500).json(exchangeResult);
  }
});

export default router;
