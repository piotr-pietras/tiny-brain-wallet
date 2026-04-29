import { useCallback, useEffect, useState } from "react";
import {
  BitcoinNetwork,
  Blockchain,
  DerivedOptions,
  EthereumNetwork,
} from "../../types";

export function useDeriveNodeForm() {
  const [_blockchain, _setBlockchain] = useState<Blockchain>("bitcoin");
  const [_network, _setNetwork] = useState<BitcoinNetwork | EthereumNetwork>(
    "easy-regtest"
  );
  const [_account, _setAccount] = useState<string>("0");
  const [_change, _setChange] = useState<string>("0");
  const [_index, _setIndex] = useState<string>("0");

  const getBlockchainOptions = useCallback((): Blockchain[] => {
    return ["bitcoin", "ethereum"] as Blockchain[];
  }, []);

  const getNetworkOptions = useCallback(():
    | BitcoinNetwork[]
    | EthereumNetwork[] => {
    switch (_blockchain) {
      case "bitcoin":
        return ["mainnet", "testnet4", "easy-regtest"] as BitcoinNetwork[];
      case "ethereum":
        return ["sepolia"] as EthereumNetwork[];
      default:
        return [];
    }
  }, [_blockchain]);

  const get = useCallback(async (): Promise<DerivedOptions> => {
    return {
      blockchain: _blockchain,
      addressType: _blockchain === "bitcoin" ? "p2wpkh" : undefined,
      network: _network,
      account: _account,
      change: _change,
      index: _index,
    } as DerivedOptions;
  }, [_account, _change, _index, _network]);

  useEffect(() => {
    switch (_blockchain) {
      case "bitcoin":
        _setNetwork("easy-regtest");
        break;
      case "ethereum":
        _setNetwork("sepolia");
        break;
    }
  }, [_blockchain]);

  return {
    get,
    getBlockchainOptions,
    getNetworkOptions,
    blockchain: _blockchain,
    setBlockchain: _setBlockchain,
    network: _network,
    setNetwork: _setNetwork,
    account: _account,
    setAccount: _setAccount,
    change: _change,
    setChange: _setChange,
    index: _index,
    setIndex: _setIndex,
  };
}
