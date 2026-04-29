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

  async getTxCount(
    address: string,
    type: "latest" | "pending" = "latest"
  ): Promise<number> {
    const response = await fetch(
      this._url,
      {
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
      }
    );
    const data = await response.json();
    return data?.result;
  }

  async getBalance(address: string): Promise<string> {
    const response = await fetch(
      this._url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [address, 'latest'],
          id: 1,
        }),
      }
    );
    const data = await response.json();
    return data?.result;
  }

  async sendRawTransaction(tx: string): Promise<string> {
    const response = await fetch(
      this._url,
      {
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
      }
    );
    const data = await response.json();
    return data?.result;
  }
}
