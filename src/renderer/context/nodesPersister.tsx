import React, { createContext, useState } from "react";
import { DerivedOptions, ReturnedWalletNode } from "../../types";
import { Ipc } from "../ipc";

interface NodesPersisterContextType {
  setNode: (node: ReturnedWalletNode) => void;
  getNodeId: (
    walletFile: string,
    derivedOptions: DerivedOptions
  ) => Promise<string | undefined>;
  getNode: (id: string) => ReturnedWalletNode | undefined;
  getNodes: (walletFile: string) => ReturnedWalletNode[];
  deleteNode: (id: string) => void;
}

export const NodesPersisterContext = createContext<NodesPersisterContextType>({
  setNode: () => {},
  getNodeId: () => Promise.resolve(undefined),
  getNode: () => undefined,
  getNodes: () => [],
  deleteNode: () => {},
});

/**
 * It is used to avoid fetching the nodes from the main process every time the user navigates to a new page.
 * There is no any sensitive data in the nodes, so it is safe to persist them in the state.
 */
export function NodesPersisterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const nodes = (): Record<string, ReturnedWalletNode> =>
    JSON.parse(localStorage.getItem("nodes") || "{}");

  const setNode = (node: ReturnedWalletNode) => {
    const newNodes = {
      ...nodes(),
      [crypto.randomUUID()]: node,
    };
    localStorage.setItem("nodes", JSON.stringify(newNodes));
  };

  const getNodeId = async (
    walletFile: string,
    derivedOptions: DerivedOptions
  ) => {
    const derivedPath = await Ipc.derivePath(derivedOptions);
    return Object.entries(nodes()).find(
      ([, node]) =>
        node.derivedPath === derivedPath &&
        node.walletFile === walletFile &&
        node.derivedOptions.blockchain === derivedOptions.blockchain &&
        node.derivedOptions.network === derivedOptions.network
    )?.[0];
  };

  const getNode = (id: string) => {
    return nodes()[id];
  };

  const getNodes = (walletFile: string) => {
    return Object.values(nodes()).filter(
      (node) => node.walletFile === walletFile
    );
  };

  const deleteNode = (id: string) => {
    const newNodes = { ...nodes() };
    delete newNodes[id];
    localStorage.setItem("nodes", JSON.stringify(newNodes));
  };

  return (
    <NodesPersisterContext.Provider
      value={{
        setNode,
        getNode,
        getNodeId,
        getNodes,
        deleteNode,
      }}
    >
      {children}
    </NodesPersisterContext.Provider>
  );
}
