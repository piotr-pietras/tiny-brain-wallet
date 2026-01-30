import {
  BitcoinNetwork,
  GetAddressResponse,
  GetAddressUtxosResponse,
  GetTxResponse,
} from "../../types";

export class MempoolClient {
  private url: string = "";
  constructor(network: BitcoinNetwork) {
    switch (network) {
      case "mainnet":
        this.url = "https://mempool.space/api/";
        break;
      case "testnet4":
        this.url = "https://mempool.space/testnet4/api/";
        break;
      case "easy-regtest":
        this.url = "https://mempool.bitcoin-easy-regtest.com/api/v1/";
        break;
      default:
        throw new Error(`Invalid network: ${network}`);
    }
  }

  async getAddress(address: string): Promise<GetAddressResponse> {
    const response = await fetch(`${this.url}address/${address}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }

  async getAddressUtxos(address: string): Promise<GetAddressUtxosResponse> {
    const response = await fetch(`${this.url}address/${address}/utxo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }

  async postTransaction(tx: string): Promise<string> {
    const response = await fetch(`${this.url}tx`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: tx,
    });
    if (!response.ok) {
      const res = await response.json();
      console.error("Post transaction to Mempool client error:", res);
      throw new Error(res.error);
    }
    return response.text();
  }

  async getTransaction(txid: string): Promise<GetTxResponse> {
    const response = await fetch(`${this.url}tx/${txid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }
}
