import { formatUnits } from "ethers";

export function toBtc(value: number, decimals = 8) {
  return Number((value / Math.pow(10, 8)).toFixed(decimals));
}

export function toEth(value: bigint) {
  return formatUnits(value, "ether");
}

export function toGwei(value: bigint) {
  return formatUnits(value, "gwei");
}
