import { ethers } from "ethers";

export type Blockchain = "bitcoin" | "ethereum";
export type BitcoinNetwork = "mainnet" | "testnet4" | "easy-regtest";
export type EthereumNetwork = "mainnet" | "sepolia";
export type BitcoinAddressType = "p2wpkh";
export type PrivateKeyCreationWay =
  | "mnemonic"
  | "custom mnemonic"
  | "masterkey";

export type Encrypted = { salt: string; iv: string; data: string };

export interface ToStoreWalletData {
  creationWay: PrivateKeyCreationWay;
  creationData: string;
  password: string;
}

type StoredWalletData = Omit<
  ToStoreWalletData,
  "creationWay" | "creationData" | "password"
> & {
  masterKeyEncrypted: Encrypted;
};

export type ReturnedWalletData = Omit<
  StoredWalletData,
  "masterKeyEncrypted"
> & {
  file: string;
};

type BaseDerivedOptions = {
  blockchain: Blockchain;
  account: string;
  change: string;
  index: string;
};

export type EthereumDerivedOptions = BaseDerivedOptions & {
  blockchain: "ethereum";
  network: EthereumNetwork;
  account: string;
  change: string;
  index: string;
};

export type BitcoinDerivedOptions = BaseDerivedOptions & {
  blockchain: "bitcoin";
  addressType: BitcoinAddressType;
  network: BitcoinNetwork;
  account: string;
  change: string;
  index: string;
};

export type DerivedOptions = BitcoinDerivedOptions | EthereumDerivedOptions;

export type BaseReturnedWalletNode = {
  walletFile: string;
  derivedPath: string;
  address: string;
};

type ReturnedBitcoinWalletNode = BaseReturnedWalletNode & {
  derivedOptions: BitcoinDerivedOptions;
};

type ReturnedEthereumWalletNode = BaseReturnedWalletNode & {
  derivedOptions: EthereumDerivedOptions;
};

export type ReturnedWalletNode =
  | ReturnedBitcoinWalletNode
  | ReturnedEthereumWalletNode;

export type ReturnedWalletNodeWithId = ReturnedWalletNode & {
  id: string;
};

type BitcoinTransactionInputs = {
  wallet: ReturnedBitcoinWalletNode;
  selectedUtxos: Pick<UtxoMempool, "txid" | "vout">[];
  toAddress: string;
  amount: number;
  fee: number;
  exchange: number;
  opReturnData?: string;
};

export type EthereumTransactionInputs = {
  wallet: ReturnedEthereumWalletNode;
  toAddress: string;
  amount: bigint;
  gasPrice: bigint;
  data?: string;
  gasLimit?: bigint;
};

export interface Signable<T> {
  signer: (privateKey: string) => Promise<T>;
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
  getMempoolData: (
    address: string,
    network: BitcoinNetwork
  ) => Promise<{
    overview: GetAddressResponse;
    utxos: GetAddressUtxosResponse;
  }>;
  getEthereumBalance: (
    address: string,
    network: EthereumNetwork
  ) => Promise<string>;
  derivePath: (derivedOptions: DerivedOptions) => Promise<string>;
  generateMnemonic: () => Promise<string>;
  isBitcoinAddressValid: (
    address: string
  ) => Promise<{ valid: boolean; network?: BitcoinNetwork }>;
  isEthereumAddressValid: (address: string) => Promise<{ valid: boolean }>;
  sendBitcoinTransaction: (
    inputs: BitcoinTransactionInputs,
    password: string
  ) => Promise<string>;
  sendEthereumTransaction: (
    inputs: EthereumTransactionInputs,
    password: string
  ) => Promise<string>;
  getEthereumContractFunctions: (
    abi: string
  ) => Promise<ethers.FunctionFragment[]>;
  checkEthereumContractInputs: (
    contractInputs: EthereumContractInputs<any>
  ) => Promise<{
    valid: boolean;
    code?: EthereumContractInputsError;
    argument?: string;
  }>;
  callEthereumContract: (
    contractInputs: EthereumContractInputs<any>
  ) => Promise<string>;
  estimateEthereumGas: (
    node: ReturnedEthereumWalletNode,
    contractInputs: EthereumContractInputs<any>
  ) => Promise<string>;
  mutateEthereumContract: (
    inputs: Omit<EthereumTransactionInputs, "toAddress">,
    contractInputs: EthereumContractInputs<any>,
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

export type StoredEthContract = {
  network: EthereumNetwork;
  name: string;
  address: string;
  abi: string;
};

export type StoredEthContractWithId = StoredEthContract & {
  id: string;
};

export type EthereumContractInputs<T> = {
  contract: StoredEthContract;
  functionName: string;
  inputs: T;
};

export type EthereumContractInputsError =
  | "MISSING_ARGUMENT"
  | "INVALID_ARGUMENT";

declare global {
  interface Window {
    api: BridgeApi;
  }
}
