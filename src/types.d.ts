import { Psbt } from "bitcoinjs-lib";

export type Blockchain = "bitcoin";
export type BitcoinNetwork = "mainnet" | "testnet4" | "easy-regtest";
export type BitcoinAddressType = "p2wpkh";
export type PrivateKeyCreationWay = "mnemonic" | "custom mnemonic" | "masterkey";

export type Encrypted = { salt: string; iv: string; data: string };

export interface ToStoreWalletData {
  creationWay: PrivateKeyCreationWay;
  creationData: string;
  password: string;
}

type StoredWalletData = Omit<ToStoreWalletData, "creationWay" | "creationData" | "password"> & {
  masterKeyEncrypted: Encrypted;
};

export type ReturnedWalletData = Omit<
  StoredWalletData,
  "masterKeyEncrypted"
> & {
  file: string;
};

export type BitcoinDerivedOptions = {
  blockchain: "bitcoin";
  addressType: BitcoinAddressType;
  network: BitcoinNetwork;
  account: string;
  change: string;
  index: string;
};

export type DerivedOptions = BitcoinDerivedOptions;

type ReturnedBitcoinWalletNode = {
  walletFile: string;
  derivedPath: string;
  derivedOptions: BitcoinDerivedOptions;
  address: string;
};

export type ReturnedWalletNode = ReturnedBitcoinWalletNode;

type BitcoinTransactionInputs = {
  wallet: ReturnedBitcoinWalletNode;
  selectedUtxos: Pick<UtxoMempool, "txid" | "vout">[];
  toAddress: string;
  amount: number;
  fee: number;
  exchange: number;
};

export type TransactionInputs = BitcoinTransactionInputs;
export interface Signable<T> {
  signer: (privateKey: string) => Promise<T>;
  psbt: Psbt;
}

export interface BridgeApi {
  versions: () => { node: string; chrome: string; electron: string };
  restartWindow: () => Promise<void>;
  storeWallet: (data: ToStoreWalletData) => Promise<string>;
  deleteWallet: (file: string) => Promise<boolean>;
  getWallets: () => Promise<ReturnedWalletData[]>;
  getWalletNode: (
    file: string,
    password: string,
    derivedPathOptions: DerivedOptions
  ) => Promise<ReturnedWalletNode | null>;
  getBitcoinAddressInfo: (
    address: string,
    network: BitcoinNetwork
  ) => Promise<{
    overview: GetAddressResponse;
    utxos: GetAddressUtxosResponse;
  }>;
  derivePath: (derivedOptions: DerivedOptions) => Promise<string>;
  generateMnemonic: () => Promise<string>;
  isAddressValid: (
    address: string
  ) => Promise<{ valid: boolean; network?: BitcoinNetwork }>;
  sendTransaction: (
    inputs: BitcoinTransactionInputs,
    password: string
  ) => Promise<string>;
}

export type GetAddressResponse = {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
};

export interface UtxoMempool {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
  value: number;
}

export type GetAddressUtxosResponse = UtxoMempool[];

export interface TxMempool {
  txid: string;
  fee: number;
  weight: number;
  size: number;
  vin: {
    txid: string;
    vout: number;
    prevout: {
      value: number;
      scriptpubkey: string;
      scriptpubkey_address: string;
    };
  }[];
  vout: {
    value: number;
    scriptpubkey: string;
    scriptpubkey_address: string;
  }[];
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
}

export type GetTxResponse = TxMempool;

declare global {
  interface Window {
    api: BridgeApi;
  }
}
