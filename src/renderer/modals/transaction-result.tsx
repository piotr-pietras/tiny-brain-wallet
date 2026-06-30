import React, { useMemo } from "react";
import { View } from "../components/View";
import { Card } from "../components/Card";
import { Text } from "../components/Text";
import { Button } from "../components/Button";
import { NoteBox } from "../components/NoteBox";
import { ReturnedWalletNode } from "../../types";
import { BackgroundTint } from "./background-tint";

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
  const transactionUrl = useMemo(() => {
    if (node.derivedOptions.blockchain === "bitcoin") {
      switch (node.derivedOptions.network) {
        case "mainnet":
          return `https://mempool.space/tx/${txId}`;
        case "testnet4":
          return `https://mempool.space/testnet4/tx/${txId}`;
        case "easy-regtest":
          return `https://mempool.bitcoin-easy-regtest.com/tx/${txId}`;
      }
    }
    if (node.derivedOptions.blockchain === "ethereum") {
      switch (node.derivedOptions.network) {
        case "mainnet":
          return `https://etherscan.io/tx/${txId}`;
        case "sepolia":
          return `https://sepolia.etherscan.io/tx/${txId}`;
      }
    }
  }, [txId, node.derivedOptions.network]);

  return (
    <BackgroundTint>
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
                      href={transactionUrl}
                      target="_blank"
                      style={{ fontWeight: "bold", fontSize: 12 }}
                    >
                      {transactionUrl}
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
    </BackgroundTint>
  );
}
