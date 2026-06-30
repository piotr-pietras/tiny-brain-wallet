import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { View } from "../../components/View";
import { Text } from "../../components/Text";
import { Input } from "../../components/Input";
import { Loader } from "../../components/Loader";

import { Button } from "../../components/Button";
import { TransactionResultModal } from "../../modals/transaction-result";
import { ReturnedEthereumWalletNode } from "../../../types";
import { NodesPersisterContext } from "../../context/nodesPersister";
import { EnterPasswordModal } from "../../modals/enter-password";
import { unwrapIpcError } from "../../helpers/unwrapIpcError";
import { useCreateEthereumTransactionForm } from "../../hooks/useCreateEthereumTransactionForm";
import { toEth, toGwei } from "../../helpers/unit";
import { ETH_TX_GAS_LIMIT } from "../../const";

export default function EthCreateTransactionScreen() {
  const { nodeId } = useParams();
  const { getNode } = useContext(NodesPersisterContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showSignTransactionModal, setShowSignTransactionModal] =
    useState(false);
  const [showEnterPasswordModal, setShowEnterPasswordModal] = useState(false);
  const [node, setNode] = useState<ReturnedEthereumWalletNode | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useCreateEthereumTransactionForm(node);

  const loadNode = async () => {
    const node = getNode(nodeId!) as ReturnedEthereumWalletNode;
    if (!node) throw new Error("Node not found");

    const balance = await window.api.getEthereumBalance(
      node.address,
      node.derivedOptions.network
    );

    form.setBalance(BigInt(balance));
    setNode(node);
    setIsLoading(false);
  };

  useEffect(() => {
    loadNode();
  }, []);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleCreate = async () => {
    const isValid = await form.validate();
    if (!isValid) return;

    setShowEnterPasswordModal(true);
  };

  if (isLoading) return <Loader fullScreen />;

  const handleSign = async (password: string) => {
    const transactionInputs = await form.get();
    try {
      const result = await window.api.sendEthereumTransaction(
        transactionInputs,
        password
      );
      setErrorMessage("");
      setTxId(result);
    } catch (error) {
      if (unwrapIpcError(error).includes("Invalid wallet password")) {
        throw error;
      }
      setErrorMessage(unwrapIpcError(error));
    } finally {
      setShowSignTransactionModal(true);
      setShowEnterPasswordModal(false);
    }
  };

  const handleDone = () => {
    setShowSignTransactionModal(false);
    setShowEnterPasswordModal(false);
    if (txId && !errorMessage) navigate(-1);
  };

  return (
    <>
      {showSignTransactionModal && (
        <TransactionResultModal
          onDone={handleDone}
          node={node!}
          txId={txId}
          errorMessage={errorMessage}
        />
      )}
      {showEnterPasswordModal && (
        <EnterPasswordModal
          onCancel={() => setShowEnterPasswordModal(false)}
          onAccept={handleSign}
        />
      )}
      <View style={{ padding: "16px" }} gap={16}>
        <Text type="title" bold>
          📝 Create Transaction
        </Text>
        <View gap={16} full>
          <View full>
            <Text type="label">Send to address:</Text>
            <Input
              value={form.toAddress || ""}
              onChange={form.setToAddress}
              form={form}
              name="toAddress"
              placeholder="Enter the recipient address"
            />
          </View>
          <View>
            <Text type="label">Amount to send (wei):</Text>
            <View direction="row">
              <Input
                type="number"
                value={form.amount}
                onChange={form.setAmount}
                form={form}
                name="amount"
                placeholder="Enter the amount to send"
              />
              <Button text="Send All" type="text" onClick={form.setSpendAll} />
            </View>
            <Text type="label">
              📌 equals to {toEth(form.overview.amount)} ETH
            </Text>
          </View>
          <View>
            <Text type="label">Gas price (wei):</Text>
            <Input
              type="number"
              value={form.gasPrice}
              onChange={form.setGasPrice}
              form={form}
              name="gasPrice"
            />
            <Text type="label">
              📌 equals to {toGwei(form.overview.gasPrice)} Gwei
            </Text>
            <Text type="label">
              💸 Fee:
              {toEth(form.overview.gasPrice * BigInt(ETH_TX_GAS_LIMIT))} ETH
            </Text>
          </View>
          <View direction="row" gap={32} style={{ marginTop: 16 }}>
            <Button text="Cancel  " type="text" onClick={handleCancel} />
            <Button
              loading={isLoading}
              text="Send"
              type="primary"
              onClick={handleCreate}
            />
          </View>
        </View>
      </View>
    </>
  );
}
