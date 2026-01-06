import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router";
import AppLayout from "./_layout";
import WalletsScreen from "./screens/wallets/wallets";
import StartScreen from "./screens/start/start";
import CreateWalletScreen from "./screens/create-wallet/create-wallet";
import NodeScreen from "./screens/node/node";
import CreateTransactionScreen from "./screens/create-transaction/create-transaction";
import Header from "./components/Header";
import { ErrorBoundary } from "./components/ErrorBoundary";
import DeriveNodeScreen from "./screens/derive-node/derive-node";
import { NodesPersisterProvider } from "./context/nodesPersister";

function App() {
  return (
    <ErrorBoundary>
      <NodesPersisterProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<StartScreen />} />
              <Route path="/wallets" element={<WalletsScreen />} />
              <Route path="/wallet">
                <Route path="/wallet/create" element={<CreateWalletScreen />} />
                <Route element={<Header />}>
                  <Route
                    path="/wallet/:walletFile/derive-node"
                    element={<DeriveNodeScreen />}
                  />
                  <Route
                    path="/wallet/:walletFile/node/:nodeId"
                    element={<NodeScreen />}
                  />
                </Route>
                <Route
                  path="/wallet/:walletFile/node/:nodeId/create-transaction"
                  element={<CreateTransactionScreen />}
                />
              </Route>
            </Route>
          </Routes>
        </HashRouter>
      </NodesPersisterProvider>
    </ErrorBoundary>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
