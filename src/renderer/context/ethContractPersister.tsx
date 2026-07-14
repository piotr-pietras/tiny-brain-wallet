import React, { createContext } from "react";
import { StoredEthContract, StoredEthContractWithId } from "../../types";

interface EthContractPersisterContextType {
  setEthContract: (ethContract: StoredEthContract) => void;
  getEthContract: (id: string) => StoredEthContractWithId | undefined;
  getEthContracts: () => StoredEthContractWithId[];
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

  const setEthContract = (ethContract: StoredEthContract) => {
    const id = crypto.randomUUID();
    const newEthContracts = {
      ...ethContracts(),
      [id]: { ...ethContract, id },
    };
    localStorage.setItem("ethContracts", JSON.stringify(newEthContracts));
    return id;
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
