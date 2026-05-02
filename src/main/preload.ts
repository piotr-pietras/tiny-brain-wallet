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
  EthereumNetwork,
  EthereumTransactionInputs,
} from "../types";
import { ethers } from "ethers";

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
  getMempoolData: (
    address: string,
    network: BitcoinNetwork
  ): Promise<{
    overview: GetAddressResponse;
    utxos: GetAddressUtxosResponse;
  }> => ipcRenderer.invoke("get-mempool-data", address, network),
  getEthereumBalance: (address: string, network: EthereumNetwork): Promise<string> =>
    ipcRenderer.invoke("get-ethereum-balance", address, network),
  deleteWallet: (file: string) => ipcRenderer.invoke("delete-wallet", file),
  derivePath: (derivedOptions: DerivedOptions): Promise<string> =>
    ipcRenderer.invoke("derive-path", derivedOptions),
  generateMnemonic: (): Promise<string> =>
    ipcRenderer.invoke("generate-mnemonic"),
  isBitcoinAddressValid: (
    address: string
  ): Promise<{ valid: boolean; network: BitcoinNetwork }> =>
    ipcRenderer.invoke("is-bitcoin-address-valid", address),
  isEthereumAddressValid: (
    address: string
  ): Promise<{ valid: boolean }> =>
    ipcRenderer.invoke("is-ethereum-address-valid", address),
  sendBitcoinTransaction: (
    inputs: BitcoinTransactionInputs,
    password: string
  ): Promise<string> =>
    ipcRenderer.invoke("send-bitcoin-transaction", inputs, password),
  sendEthereumTransaction: (
    inputs: EthereumTransactionInputs,
    password: string
  ): Promise<string> =>
    ipcRenderer.invoke("send-ethereum-transaction", inputs, password),
  getEthereumContractFunctions: (abi: string): Promise<ethers.FunctionFragment[]> =>
    ipcRenderer.invoke("get-ethereum-contract-functions", abi),
};

contextBridge.exposeInMainWorld("api", bridgeApi);
