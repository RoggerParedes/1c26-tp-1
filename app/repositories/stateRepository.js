const backend = process.env.STATE_BACKEND ?? "redis";

const impl = await (async () => {
  switch (backend) {
    case "redis":
      return await import("./redisStateRepository.js");
    default:
      throw new Error(`Unknown STATE_BACKEND: ${backend}`);
  }
})();

export const init = impl.init;
export const getAccounts = impl.getAccounts;
export const getAccountById = impl.getAccountById;
export const getAccountByCurrency = impl.getAccountByCurrency;
export const setAccountBalance = impl.setAccountBalance;
export const updateAccountBalanceDelta = impl.updateAccountBalanceDelta;
export const getRates = impl.getRates;
export const getRate = impl.getRate;
export const setRate = impl.setRate;
export const getLog = impl.getLog;
export const appendLog = impl.appendLog;
