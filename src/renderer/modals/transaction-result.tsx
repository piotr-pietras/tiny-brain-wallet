import React, { useMemo, useState } from "react";
import { View } from "../components/View";
import { Card } from "../components/Card";
import { Text } from "../components/Text";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { NoteBox } from "../components/NoteBox";
import { ReturnedWalletNode } from "../../types";

type Props = {
  onDone: () => void;
  txId: string | null;
  errorMessage: string | null;
  node: ReturnedWalletNode;
};

export function TransactionResultModal({
  onDone,
  txId,
  errorMessage,
  node,
}: Props) {
  const mempoolTransactionUrl = useMemo(() => {
    switch (node.derivedOptions.network) {
      case "mainnet":
        return `https://mempool.space/tx/${txId}`;
      case "testnet4":
        return `https://mempool.space/testnet4/tx/${txId}`;
      case "easy-regtest":
        return `https://mempool.bitcoin-easy-regtest.com/tx/${txId}`;
    }
  }, [txId, node.derivedOptions.network]);

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
          <Text type="title">Transaction Result</Text>
          {errorMessage && <NoteBox type="error" text={errorMessage} />}
          {txId && (
            <NoteBox
              type="success"
              text={
                <View direction="column" gap={8}>
                  <Text type="label" bold>
                    {txId}
                  </Text>
                  <View direction="column" gap={0}>
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
                </View>
              }
            />
          )}

          <View direction="row" gap={32} style={{ marginTop: 16 }}>
            <Button text="Done" type="primary" onClick={onDone} />
          </View>
        </View>
      </Card>
    </View>
  );
}
