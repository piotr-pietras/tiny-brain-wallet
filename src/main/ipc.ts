import { ipcMain } from "electron";
import {
  ToStoreWalletData,
  BitcoinTransactionInputs,
  DerivedOptions,
  ReturnedWalletNode,
  BitcoinNetwork,
} from "../types";
import { Wallet } from "./utils/wallet";
import { Crypto } from "./utils/crypto";
import { BtcAddress } from "./utils/btc-address";
import { MempoolClient } from "./utils/mempool-client";
import { BtcTransaction } from "./utils/btc-transaction";
import { restartWindow } from ".";
import * as bip39 from "bip39";
import { HD } from "./utils/hd";

export const registerHandlers = () => {
  ipcMain.handle("restart-window", () => restartWindow());
  ipcMain.handle("store-wallet", async (_, data: ToStoreWalletData) => {
    let masterKey: string;
    switch (data.creationWay) {
      case "masterkey":
        masterKey = data.creationData;
        break;
      default:
        masterKey = await HD.produceMasterKey(data.creationData);
    }
    const masterKeyEncrypted = await Crypto.encrypt(masterKey, data.password);
    Wallet.store({ ...data, masterKeyEncrypted });
  });
  ipcMain.handle("delete-wallet", (_, walletFile: string) =>
    Wallet.delete(walletFile)
  );
  ipcMain.handle("get-wallets", () => Wallet.getAll());
  ipcMain.handle(
    "get-wallet-node",
    async (
      _,
      walletFile: string,
      password: string,
      derivedOptions: DerivedOptions
    ): Promise<ReturnedWalletNode | null> => {
      const masterKeyEncrypted = await Wallet.getMasterKeyEncrypted(walletFile);
      const masterKey = await Crypto.decrypt(masterKeyEncrypted, password);
      const derivedPath = HD.buildDerivedPath(derivedOptions);
      const privateKey = await HD.derivePrivateKey(masterKey, derivedPath);
      if (!privateKey) return null;
      const address = BtcAddress.createP2wpkh(
        privateKey,
        derivedOptions.network
      );
      return {
        walletFile,
        derivedPath,
        derivedOptions,
        address,
      };
    }
  );
  ipcMain.handle(
    "get-mempool-data",
    async (_, address: string, network: BitcoinNetwork) => {
      const mempool = new MempoolClient(network);
      const [overview, utxos] = await Promise.all([
        mempool.getAddress(address),
        mempool.getAddressUtxos(address),
      ]);
      return { overview, utxos };
    }
  );
  ipcMain.handle("derive-path", async (_, derivedOptions: DerivedOptions) =>
    HD.buildDerivedPath(derivedOptions)
  );
  ipcMain.handle("generate-mnemonic", () => bip39.generateMnemonic());
  ipcMain.handle("is-address-valid", (_, address: string) =>
    BtcAddress.isAddressValid(address)
  );
  ipcMain.handle(
    "send-transaction",
    async (_, inputs: BitcoinTransactionInputs, password: string) => {
      const { walletFile: file, derivedOptions: derivedPathOptions } =
        inputs.wallet;
      const mempool = new MempoolClient(derivedPathOptions.network);
      const transaction = new BtcTransaction(mempool);
      await transaction.create(inputs, { rbf: true });
      const txHex = await Wallet.signTransaction(
        file,
        derivedPathOptions,
        transaction,
        password
      );
      const result = await mempool.postTransaction(txHex);
      return result;
    }
  );
};
