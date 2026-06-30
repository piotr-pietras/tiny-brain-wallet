import { BaseWallet, SigningKey, TransactionRequest } from "ethers";
import { EthereumTransactionInputs, Signable } from "../../types";
import { DrpcClient } from "./drpc-client";
import { ETH_TX_GAS_LIMIT } from "../const";

export class EthTransaction implements Signable<string> {
  private _chainId: number = 1;
  private _txHex: string | null = null;
  private _txReq: TransactionRequest | null = null;

  constructor(private readonly drpc: DrpcClient) {}

  async create(inputs: EthereumTransactionInputs): Promise<EthTransaction> {
    if (this._txHex)
      throw new Error("Transaction is already done in this instance");

    switch (inputs.wallet.derivedOptions.network) {
      case "mainnet":
        this._chainId = 1;
        break;
      case "sepolia":
        this._chainId = 11155111;
        break;
      default:
        throw new Error("Invalid network");
    }

    const nonce = await this.drpc.getTxCount(inputs.wallet.address);

    this._txReq = {
      from: inputs.wallet.address,
      to: inputs.toAddress,
      value: inputs.amount,
      gasLimit: inputs.gasLimit ?? BigInt(ETH_TX_GAS_LIMIT),
      gasPrice: inputs.gasPrice,
      nonce,
      chainId: this._chainId,
      data: inputs.data,
    };

    return this;
  }

  async signer(privateKey: string): Promise<string> {
    if (!this._txReq) throw new Error("Transaction request is not created");
    if (this._txHex) throw new Error("Transaction is already signed");

    const buffer = Buffer.from(privateKey, "hex");
    const ecPair = new SigningKey(buffer);
    const wallet = new BaseWallet(ecPair);

    this._txHex = await wallet.signTransaction(this._txReq);

    return this._txHex;
  }
}
