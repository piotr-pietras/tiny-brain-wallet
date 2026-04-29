import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router";
import AppLayout from "./_layout";
import WalletsScreen from "./screens/wallets/wallets";
import StartScreen from "./screens/start/start";
import CreateWalletScreen from "./screens/create-wallet/create-wallet";
import BtcNodeScreen from "./screens/node/btc-node";
import Header from "./components/Header";
import DeriveNodeScreen from "./screens/derive-node/derive-node";
import { NodesPersisterProvider } from "./context/nodesPersister";
import EthNodeScreen from "./screens/node/eth-node";
import BtcCreateTransactionScreen from "./screens/create-transaction/btc-create-transaction";
import EthCreateTransactionScreen from "./screens/create-transaction/eth-create-transaction";

function App() {
  return (
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
                  path="/wallet/:walletFile/btc-node/:nodeId"
                  element={<BtcNodeScreen />}
                />
                <Route
                  path="/wallet/:walletFile/eth-node/:nodeId"
                  element={<EthNodeScreen />}
                />
              </Route>
              <Route
                path="/wallet/:walletFile/btc-node/:nodeId/btc-create-transaction"
                element={<BtcCreateTransactionScreen />}
              />
              <Route
                path="/wallet/:walletFile/eth-node/:nodeId/eth-create-transaction"
                element={<EthCreateTransactionScreen />}
              />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </NodesPersisterProvider>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
