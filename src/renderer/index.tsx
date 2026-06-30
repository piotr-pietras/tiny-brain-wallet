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
import EthNodeScreen from "./screens/node/eth-node";
import BtcCreateTransactionScreen from "./screens/create-transaction/btc-create-transaction";
import EthCreateTransactionScreen from "./screens/create-transaction/eth-create-transaction";
import AddEthContractScreen from "./screens/eth-contract/add-eth-contract";
import ExecuteEthContractScreen from "./screens/eth-contract/execute-eth-contract";
import { ContextProviders } from "./context";

function App() {
  return (
    <ContextProviders>
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
              <Route
                path="/wallet/:walletFile/eth-node/:nodeId/execute-eth-contract/:contractId"
                element={<ExecuteEthContractScreen />}
              />
            </Route>
            <Route element={<Header />}>
              <Route
                path="/add-eth-contract"
                element={<AddEthContractScreen />}
              />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </ContextProviders>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
