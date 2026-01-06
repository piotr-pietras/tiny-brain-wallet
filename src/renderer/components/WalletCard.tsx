import React from "react";
import { ReturnedWalletData } from "../../types";
import { Card } from "./Card";
import { Text } from "./Text";

type Props = {
  wallet: ReturnedWalletData;
  onClick: () => void;
};

export function WalletCard({ wallet, onClick }: Props) {
  return (
    <Card onClick={onClick}>
      <Text type="body" bold>
        📦 {wallet.file}
      </Text>
    </Card>
  );
}
