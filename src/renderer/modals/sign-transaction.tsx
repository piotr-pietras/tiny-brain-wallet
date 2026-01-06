import React, { useMemo, useState } from "react";
import { View } from "../components/View";
import { Card } from "../components/Card";
import { Text } from "../components/Text";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Ipc } from "../ipc";
import { useCreateTransactionForm } from "../hooks/useCreateTransactionForm";
import { NoteBox } from "../components/NoteBox";
import { Divider } from "../components/Divider";
import { ReturnedWalletNode } from "../../types";

type Props = {
  onCancel: () => void;
  onDone: () => void;
  form: Pick<ReturnType<typeof useCreateTransactionForm>, "get">;
  wallet: ReturnedWalletNode | null;
};

export function SignTransactionModal({
  onCancel,
  onDone,
  form,
  wallet,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [txId, setTxId] = useState("");
  const [error, setError] = useState("");

  const handleSign = async () => {
    try {
      setIsLoading(true);
      const transactionInputs = await form.get();
      const result = await Ipc.sendTransaction(transactionInputs, password);
      setError("");
      setTxId(result);
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const mempoolTransactionUrl = useMemo(() => {
    switch (wallet?.derivedOptions.network) {
      case "mainnet":
        return `https://mempool.space/tx/${txId}`;
      case "testnet4":
        return `https://mempool.space/testnet4/tx/${txId}`;
      case "easy-regtest":
        return `https://mempool.bitcoin-easy-regtest.com/tx/${txId}`;
    }
  }, [txId, wallet?.derivedOptions.network]);

  return (
    <View
      direction="column"
      gap={16}
      style={{
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
      }}
    >
      <Card>
        <View direction="column" gap={16} style={{}}>
          <Text type="title">Sign Transaction</Text>
          {!txId && (
            <View>
              <Text type="label">Wallet Password:</Text>
              <Input
                value={password}
                onChange={setPassword}
                placeholder="Enter the wallet's password"
                type="password"
              />
            </View>
          )}
          {error && <NoteBox type="error" text={error} />}
          {txId && (
            <NoteBox
              type="success"
              text={
                <View direction="column" gap={8}>
                  <Text type="label">
                    Transaction sent successfully with txId:
                  </Text>
                  <Text type="label" bold>
                    {txId}
                  </Text>
                  <Divider />
                  <Text type="label">
                    In order to see datails of transaction you have to visit
                    mempool website:
                  </Text>
                  <a
                    href={mempoolTransactionUrl}
                    target="_blank"
                    style={{ fontWeight: "bold", fontSize: 12 }}
                  >
                    {mempoolTransactionUrl}
                  </a>
                </View>
              }
            />
          )}

          <View direction="row" gap={32} style={{ marginTop: 16 }}>
            {!txId ? (
              <>
                <Button
                  loading={isLoading}
                  text="Cancel"
                  type="text"
                  onClick={onCancel}
                />
                <Button
                  loading={isLoading}
                  text="Send"
                  type="primary"
                  onClick={handleSign}
                />
              </>
            ) : (
              <Button
                loading={isLoading}
                text="Done"
                type="text"
                onClick={onDone}
              />
            )}
          </View>
        </View>
      </Card>
    </View>
  );
}
