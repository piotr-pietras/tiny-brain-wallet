import { EthereumNetwork } from "../../types";

export class DrpcClient {
  private _url: string = "";
  constructor(network: EthereumNetwork) {
    switch (network) {
      case "mainnet":
        this._url = "https://eth.drpc.org";
        break;
      case "sepolia":
        this._url = "https://sepolia.drpc.org";
        break;
      default:
        throw new Error(`Invalid network: ${network}`);
    }
  }

  private async resolve<T>(response: Response): Promise<T> {
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.result;
  }

  async getTxCount(
    address: string,
    type: "latest" | "pending" = "latest"
  ): Promise<number> {
    const response = await fetch(this._url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionCount",
        params: [address, type],
        id: 1,
      }),
    });
    return this.resolve<number>(response);
  }

  async getBalance(address: string): Promise<string> {
    const response = await fetch(this._url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
    });
    return this.resolve<string>(response);
  }

  async sendRawTransaction(tx: string): Promise<string> {
    const response = await fetch(this._url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_sendRawTransaction",
        params: [tx],
        id: 1,
      }),
    });
    return this.resolve<string>(response);
  }

  async call(address: string, data: string): Promise<string> {
    const response = await fetch(this._url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: address,
            data,
          },
          "latest",
        ],
        id: 1,
      }),
    });
    return this.resolve<string>(response);
  }

  async estimateGas(
    addressFrom: string,
    addressTo: string,
    data: string
  ): Promise<string> {
    const response = await fetch(this._url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_estimateGas",
        params: [
          {
            from: addressFrom,
            to: addressTo,
            data,
          },
        ],
        id: 1,
      }),
    });
    return this.resolve<string>(response);
  }
}
