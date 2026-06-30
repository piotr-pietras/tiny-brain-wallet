import React from "react";
import { EthContractPersisterProvider } from "./ethContractPersister";
import { NodesPersisterProvider } from "./nodesPersister";

export function ContextProviders({ children }: { children: React.ReactNode }) {
  return (
    <NodesPersisterProvider>
      <EthContractPersisterProvider>{children}</EthContractPersisterProvider>
    </NodesPersisterProvider>
  );
}
