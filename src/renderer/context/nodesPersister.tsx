import React, { createContext } from "react";
import { ReturnedWalletNode, ReturnedWalletNodeWithId } from "../../types";

interface NodesPersisterContextType {
  setNode: (node: ReturnedWalletNode) => string;
  getNode: (id: string) => ReturnedWalletNodeWithId | undefined;
  getNodes: (walletFile: string) => ReturnedWalletNodeWithId[];
  deleteNode: (id: string) => void;
}

export const NodesPersisterContext = createContext<NodesPersisterContextType>({
  setNode: () => "",
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
  const nodes = (): Record<string, ReturnedWalletNodeWithId> =>
    JSON.parse(localStorage.getItem("nodes") || "{}");

  const setNode = (node: ReturnedWalletNode) => {
    const id = crypto.randomUUID();
    const newNodes = {
      ...nodes(),
      [id]: { ...node, id },
    };
    localStorage.setItem("nodes", JSON.stringify(newNodes));
    return id;
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
        getNodes,
        deleteNode,
      }}
    >
      {children}
    </NodesPersisterContext.Provider>
  );
}
