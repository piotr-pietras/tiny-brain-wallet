import React from "react";
import { UtxoMempool } from "../../types";
import { Card } from "./Card";
import { View } from "./View";
import { Text } from "./Text";
import { toBtc } from "../helpers/unit";

type Props = {
  type: "small" | "large";
  utxo: UtxoMempool;
  selected?: boolean;
  onClick?: (utxo: UtxoMempool) => void;
};

export function UtxoCard({
  type = "small",
  utxo,
  selected = false,
  onClick,
}: Props) {
  if (type === "large") {
    return (
      <Card
        onClick={() => onClick?.(utxo)}
        style={{
          border: selected
            ? "2px solid var(--primary)"
            : "2px solid transparent",
          backgroundColor: selected
            ? "var(--surface-variant)"
            : "var(--surface)",
        }}
      >
        <View
          direction="row"
          style={{
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <View>
            <Text type="label">TXID</Text>
            <Text type="body">{utxo.txid.toString().slice(0, 5)}...</Text>
          </View>
          <View>
            <Text type="label">VOUT</Text>
            <Text type="body">{utxo.vout}</Text>
          </View>
          <View>
            <Text type="label">Value</Text>
            <Text type="body" bold>
              {utxo.value} BTC
            </Text>
          </View>
          <View>
            <Text type="label">Status</Text>
            <Text type="body">
              {utxo.status.confirmed ? (
                <span> ✅ Confirmed</span>
              ) : (
                <span> ⏳ Unconfirmed</span>
              )}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card
      onClick={() => onClick?.(utxo)}
      style={{
        border: selected ? "2px solid var(--primary)" : "2px solid transparent",
        backgroundColor: selected ? "var(--surface-variant)" : "var(--surface)",
      }}
    >
      <View direction="column" gap={8}>
        <View direction="row" gap={8}>
          <Text type="label" bold>
            TXID:
          </Text>
          <Text type="label">{utxo.txid.toString().slice(0, 5)}...</Text>
        </View>
        <View direction="row" gap={8}>
          <Text type="label" bold>
            Value:
          </Text>
          <Text type="label">{toBtc(utxo.value)} BTC</Text>
        </View>
      </View>
    </Card>
  );
}
