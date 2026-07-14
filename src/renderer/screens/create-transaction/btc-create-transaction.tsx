import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { View } from "../../components/View";
import { Text } from "../../components/Text";
import { Input } from "../../components/Input";
import { Loader } from "../../components/Loader";
import { UtxoCard } from "../../components/UtxoCard";
import { NoteBox } from "../../components/NoteBox";
import { Button } from "../../components/Button";
import { TransactionResultModal } from "../../modals/transaction-result";
import {
  GetAddressUtxosResponse,
  ReturnedBitcoinWalletNode,
} from "../../../types";
import { NodesPersisterContext } from "../../context/nodesPersister";
import { EnterPasswordModal } from "../../modals/enter-password";
import { unwrapIpcError } from "../../helpers/unwrapIpcError";
import { useCreateBitcoinTransactionForm } from "../../hooks/useCreateBitcoinTransactionForm";
import { toBtc } from "../../helpers/unit";

export default function BtcCreateTransactionScreen() {
  const { nodeId } = useParams();
  const { getNode } = useContext(NodesPersisterContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showSignTransactionModal, setShowSignTransactionModal] =
    useState(false);
  const [showEnterPasswordModal, setShowEnterPasswordModal] = useState(false);
  const [node, setNode] = useState<ReturnedBitcoinWalletNode | null>(null);
  const [utxos, setUtxos] = useState<GetAddressUtxosResponse | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useCreateBitcoinTransactionForm(node);

  const loadNode = async () => {
    const node = getNode(nodeId!) as ReturnedBitcoinWalletNode;
    if (!node) throw new Error("Node not found");

    const { utxos } = await window.api.getMempoolData(
      node.address,
      node.derivedOptions.network
    );

    setNode(node);
    setUtxos(utxos);
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
      const result = await window.api.sendBitcoinTransaction(
        transactionInputs,
        password
      );
      setErrorMessage("");
      setTxId(result);
    } catch (error) {
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
          errorMessage={errorMessage}
        />
      )}
      <View style={{ padding: "16px" }} gap={16}>
        <Text type="title" bold>
          📝 Create Transaction
        </Text>
        <View full gap={16}>
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
            <Text type="label">Select UTXOs:</Text>
            <View direction="row">
              {utxos
                ?.filter((utxo) => utxo.status.confirmed)
                .map((utxo) => (
                  <UtxoCard
                    key={utxo.txid}
                    utxo={utxo}
                    type="small"
                    selected={form.isUtxoSelected(utxo)}
                    onClick={form.selectUtxo}
                  />
                ))}
            </View>
            {form.selectedUtxos.length === 0 && (
              <NoteBox type="warning" text="No UTXOs selected" />
            )}
            {form.selectedUtxos.length > 0 && (
              <View>
                <Text type="label">
                  💰 Balance: {form.overview.balance} satoshi (
                  {toBtc(form.overview.balance).toFixed(8)} BTC)
                </Text>
                <Text type="label">
                  💵 Spendable: {form.overview.spendable} satoshi (
                  {toBtc(form.overview.spendable).toFixed(8)} BTC)
                </Text>
                <Text type="label">📏 Size: {form.overview.size} bytes</Text>
              </View>
            )}
          </View>
          <View>
            <Text type="label">Amount to send (satoshi):</Text>
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
              📌 equals to {toBtc(form.overview.amount).toFixed(8)} BTC
            </Text>
          </View>
          <View>
            <Text type="label">Fee rate (sat/byte):</Text>
            <Input
              type="number"
              value={form.feeRate}
              onChange={form.setFeeRate}
              form={form}
              name="feeRate"
            />
            <Text type="label">💸 Fee: {form.overview.fee} satoshi</Text>
          </View>
          <details style={{ width: "100%" }}>
            <summary style={{ cursor: "pointer" }}>Advanced options</summary>
            <View style={{ marginTop: 8 }}>
              <Text type="label">OP Return Data:</Text>
              <Text type="label" bold>
                (String is utf-8 encoded into array of bytes)
              </Text>
              <Input
                type="text"
                multiline
                value={form.opReturnData}
                onChange={form.setOpReturnData}
                form={form}
                name="opReturnData"
                placeholder="Enter the OP return data"
              />
            </View>
          </details>
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
