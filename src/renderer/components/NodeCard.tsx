import React, { useMemo } from "react";
import { ReturnedWalletNode } from "../../types";
import { Card } from "./Card";
import { Text } from "./Text";
import { View } from "./View";

type Props = {
  node: ReturnedWalletNode;
  onClick: () => void;
};

export function NodeCard({ node, onClick }: Props) {
  const iconSrc = useMemo(() => {
    switch (node.derivedOptions.blockchain) {
      case "bitcoin":
        return require("../assets/bitcoin-icon.svg");
      default:
        return null;
    }
  }, [node]);

  return (
    <Card onClick={onClick}>
      <View direction="row" gap={16}>
        {iconSrc && <img src={iconSrc} alt="node" width={24} height={24} />}
        <View>
          <Text type="body" bold>
            {node.derivedPath}
          </Text>
          <Text type="label">{node.derivedOptions.network}</Text>
        </View>
      </View>
    </Card>
  );
}
