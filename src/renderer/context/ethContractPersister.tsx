import React, { createContext } from "react";
import { StoredEthContract } from "../../types";

interface EthContractPersisterContextType {
  setEthContract: (ethContract: StoredEthContract) => void;
  getEthContract: (id: string) => StoredEthContract | undefined;
  getEthContracts: () => any[];
  deleteEthContract: (id: string) => void;
}

export const EthContractPersisterContext =
  createContext<EthContractPersisterContextType>({
    setEthContract: () => {},
    getEthContract: () => undefined,
    getEthContracts: () => [],
    deleteEthContract: () => {},
  });

/**
 * It is used to persist the eth contracts in the local storage.
 */
export function EthContractPersisterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const ethContracts = (): Record<string, any> =>
    JSON.parse(localStorage.getItem("ethContracts") || "{}");

  const setEthContract = (ethContract: any) => {
    const newEthContracts = {
      ...ethContracts(),
      [crypto.randomUUID()]: ethContract,
    };
    localStorage.setItem("ethContracts", JSON.stringify(newEthContracts));
  };

  const getEthContract = (id: string) => {
    return ethContracts()[id];
  };

  const getEthContracts = () => {
    return Object.values(ethContracts());
  };

  const deleteEthContract = (id: string) => {
    const newEthContracts = { ...ethContracts() };
    delete newEthContracts[id];
    localStorage.setItem("ethContracts", JSON.stringify(newEthContracts));
  };

  return (
    <EthContractPersisterContext.Provider
      value={{
        setEthContract,
        getEthContract,
        getEthContracts,
        deleteEthContract,
      }}
    >
      {children}
    </EthContractPersisterContext.Provider>
  );
}
