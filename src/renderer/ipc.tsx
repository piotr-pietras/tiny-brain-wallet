import {
  ToStoreWalletData,
  BitcoinTransactionInputs,
  DerivedOptions,
  BitcoinNetwork,
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

  static getBitcoinAddressInfo(address: string, network: BitcoinNetwork) {
    return window.api.getBitcoinAddressInfo(address, network);
  }
  
  static derivePath(derivedOptions: DerivedOptions) {
    return window.api.derivePath(derivedOptions);
  }

  static generateMnemonic() {
    return window.api.generateMnemonic();
  }

  static isAddressValid(address: string) {
    return window.api.isAddressValid(address);
  }

  static sendTransaction(inputs: BitcoinTransactionInputs, password: string) {
    return window.api.sendTransaction(inputs, password);
  }
}
