import { contextBridge, ipcRenderer } from "electron";
import {
  BitcoinNetwork,
  BridgeApi,
  ReturnedWalletData,
  ReturnedWalletNode,
  ToStoreWalletData,
  BitcoinTransactionInputs,
  DerivedOptions,
  GetAddressResponse,
  GetAddressUtxosResponse,
} from "../types";

const bridgeApi: BridgeApi = {
  versions: () => process.versions,
  restartWindow: () => ipcRenderer.invoke("restart-window"),
  storeWallet: (data: ToStoreWalletData): Promise<string> =>
    ipcRenderer.invoke("store-wallet", data),
  getWallets: (): Promise<ReturnedWalletData[]> =>
    ipcRenderer.invoke("get-wallets"),
  getWalletNode: (
    file: string,
    password: string,
    derivedOptions: DerivedOptions
  ): Promise<ReturnedWalletNode | null> =>
    ipcRenderer.invoke("get-wallet-node", file, password, derivedOptions),
  getBitcoinAddressInfo: (
    address: string,
    network: BitcoinNetwork
  ): Promise<{
    overview: GetAddressResponse;
    utxos: GetAddressUtxosResponse;
  }> => ipcRenderer.invoke("get-mempool-data", address, network),
  deleteWallet: (file: string) => ipcRenderer.invoke("delete-wallet", file),
  derivePath: (derivedOptions: DerivedOptions): Promise<string> =>
    ipcRenderer.invoke("derive-path", derivedOptions),
  generateMnemonic: (): Promise<string> =>
    ipcRenderer.invoke("generate-mnemonic"),
  isAddressValid: (
    address: string
  ): Promise<{ valid: boolean; network: BitcoinNetwork }> =>
    ipcRenderer.invoke("is-address-valid", address),
  sendTransaction: (
    inputs: BitcoinTransactionInputs,
    password: string
  ): Promise<string> =>
    ipcRenderer.invoke("send-transaction", inputs, password),
};

contextBridge.exposeInMainWorld("api", bridgeApi);
