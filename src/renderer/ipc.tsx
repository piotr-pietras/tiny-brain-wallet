import {
  ToStoreWalletData,
  BitcoinTransactionInputs,
  DerivedOptions,
  BitcoinNetwork,
  EthereumNetwork,
  EthereumTransactionInputs,
} from "../types";

export class Ipc {
  static restartWindow() {
    return window.api.restartWindow();
  }

  static storeWallet(wallet: ToStoreWalletData) {
    return window.api.storeWallet(wallet);
  }

  static deleteWallet(file: string) {
    return window.api.deleteWallet(file);
  }

  static getWallets() {
    return window.api.getWallets();
  }

  static getWalletNode(
    file: string,
    password: string,
    derivedOptions: DerivedOptions
  ) {
    return window.api.getWalletNode(file, password, derivedOptions);
  }

  static getMempoolData(address: string, network: BitcoinNetwork) {
    return window.api.getMempoolData(address, network);
  }

  static getEthereumBalance(address: string, network: EthereumNetwork) {
    return window.api.getEthereumBalance(address, network);
  }

  static derivePath(derivedOptions: DerivedOptions) {
    return window.api.derivePath(derivedOptions);
  }

  static generateMnemonic() {
    return window.api.generateMnemonic();
  }

  static isBitcoinAddressValid(address: string) {
    return window.api.isBitcoinAddressValid(address);
  }

  static isEthereumAddressValid(address: string) {
    return window.api.isEthereumAddressValid(address);
  }

  static sendBitcoinTransaction(inputs: BitcoinTransactionInputs, password: string) {
    return window.api.sendBitcoinTransaction(inputs, password);
  }

  static sendEthereumTransaction(inputs: EthereumTransactionInputs, password: string) {
    return window.api.sendEthereumTransaction(inputs, password);
  }
}
