import { useCallback, useState } from "react";
import { BitcoinNetwork, Blockchain, DerivedOptions } from "../../types";

export function useDeriveAccountForm() {
  const [_blockchain, _setBlockchain] = useState<Blockchain>("bitcoin");
  const [_network, _setNetwork] = useState<BitcoinNetwork>("easy-regtest");
  const [_account, _setAccount] = useState<string>("0");
  const [_change, _setChange] = useState<string>("0");
  const [_index, _setIndex] = useState<string>("0");

  const getBlockchainOptions = useCallback((): Blockchain[] => {
    return ["bitcoin"] as Blockchain[];
  }, []);

  const getNetworkOptions = useCallback((): BitcoinNetwork[] => {
    switch (_blockchain) {
      case "bitcoin":
        return ["mainnet", "testnet4", "easy-regtest"] as BitcoinNetwork[];
      default:
        return [];
    }
  }, [_blockchain]);

  const get = useCallback(async (): Promise<DerivedOptions> => {
    return {
      blockchain: "bitcoin",
      addressType: "p2wpkh",
      network: _network,
      account: _account,
      change: _change,
      index: _index,
    } as DerivedOptions;
  }, [_account, _change, _index, _network]);

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
