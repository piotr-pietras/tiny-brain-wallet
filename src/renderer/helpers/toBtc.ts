export function toBtc(value: number, decimals = 8) {
  return Number((value / Math.pow(10, 8)).toFixed(decimals));
}
