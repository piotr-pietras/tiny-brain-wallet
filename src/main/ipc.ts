import { ipcMain } from "electron";
import {
  ToStoreWalletData,
  BitcoinTransactionInputs,
  DerivedOptions,
  ReturnedWalletNode,
  BitcoinNetwork,
  EthereumNetwork,
  EthereumTransactionInputs,
} from "../types";
import { Wallet } from "./utils/wallet";
import { Crypto } from "./utils/crypto";
import { BtcAddress } from "./utils/btc-address";
import { MempoolClient } from "./utils/mempool-client";
import { BtcTransaction } from "./utils/btc-transaction";
import { restartWindow } from ".";
import * as bip39 from "bip39";
import { HD } from "./utils/hd";
import { EthAddress } from "./utils/eth-address";
import { DrpcClient } from "./utils/drpc-client";
import { EthTransaction } from "./utils/eth-transacton";

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

      switch (derivedOptions.blockchain) {
        case "bitcoin":
          return {
            walletFile,
            derivedPath,
            derivedOptions,
            address: BtcAddress.createP2wpkh(
              privateKey,
              derivedOptions.network
            ),
          };
        case "ethereum":
          return {
            walletFile,
            derivedPath,
            derivedOptions,
            address: EthAddress.createAddress(privateKey),
          };
        default:
          // @ts-ignore
          throw new Error(`Invalid blockchain: ${derivedOptions?.blockchain}`);
      }
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
  ipcMain.handle(
    "get-ethereum-balance",
    async (_, address: string, network: EthereumNetwork) => {
      const drpc = new DrpcClient(network);
      return drpc.getBalance(address);
    }
  );
  ipcMain.handle("derive-path", async (_, derivedOptions: DerivedOptions) =>
    HD.buildDerivedPath(derivedOptions)
  );
  ipcMain.handle("generate-mnemonic", () => bip39.generateMnemonic());
  ipcMain.handle("is-bitcoin-address-valid", (_, address: string) =>
    BtcAddress.isAddressValid(address)
  );
  ipcMain.handle("is-ethereum-address-valid", (_, address: string) =>
    EthAddress.isAddressValid(address)
  );
  ipcMain.handle(
    "send-bitcoin-transaction",
    async (_, inputs: BitcoinTransactionInputs, password: string) => {
      const { walletFile, derivedOptions } = inputs.wallet;
      const mempool = new MempoolClient(derivedOptions.network);
      const transaction = new BtcTransaction(mempool);
      await transaction.create(inputs, { rbf: true });
      const txHex = await Wallet.signTransaction(
        walletFile,
        derivedOptions,
        transaction,
        password
      );
      const result = await mempool.postTransaction(txHex);
      return result;
    }
  );
  ipcMain.handle(
    "send-ethereum-transaction",
    async (_, inputs: EthereumTransactionInputs, password: string) => {
      const { walletFile, derivedOptions } = inputs.wallet;
      const drpc = new DrpcClient(derivedOptions.network);
      const transaction = new EthTransaction(drpc);
      await transaction.create(inputs);
      const txHex = await Wallet.signTransaction(
        walletFile,
        derivedOptions,
        transaction,
        password
      );
      const result = await drpc.sendRawTransaction(txHex);
      return result;
    }
  );
};
