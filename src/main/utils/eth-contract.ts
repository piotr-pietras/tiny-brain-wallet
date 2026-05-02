import { ethers } from "ethers";

export class EthContract {
  private _iface: ethers.Interface;
  private _functions: ethers.FunctionFragment[] = [];

  constructor(readonly abi: string) {
    this._iface = new ethers.Interface(abi);
    this._functions = this._iface.fragments.filter(
      (fragment): fragment is ethers.FunctionFragment =>
        fragment.type === "function"
    ) as ethers.FunctionFragment[];
  }

  get functions() {
    return this._functions;
  }
}
