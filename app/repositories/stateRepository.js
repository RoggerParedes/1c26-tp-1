import * as state from "../state.js";

export async function init() {
  return await state.init();
}

export function getAccounts() {
  return state.getAccounts();
}

export function getRates() {
  return state.getRates();
}

export function getLog() {
  return state.getLog();
}
