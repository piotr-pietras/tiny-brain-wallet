import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  GetAddressResponse,
  GetAddressUtxosResponse,
  ReturnedWalletNode,
} from "../../../types";
import { Loader } from "../../components/Loader";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import { toBtc } from "../../helpers/toBtc";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";
import { UtxoCard } from "../../components/UtxoCard";
import { NodesPersisterContext } from "../../context/nodesPersister";
import { Divider } from "../../components/Divider";
import { Ipc } from "../../ipc";

export default function NodeScreen() {
  const { walletFile, nodeId } = useParams();
  const { getNode, deleteNode } = useContext(NodesPersisterContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [node, setNode] = useState<ReturnedWalletNode | null>(null);
  const [overview, setOverview] = useState<GetAddressResponse | null>(null);
  const [utxos, setUtxos] = useState<GetAddressUtxosResponse | null>(null);

  const loadNode = async () => {
    const node = getNode(nodeId!);
    if (!node) throw new Error("Node not found");

    const { overview, utxos } = await Ipc.getBitcoinAddressInfo(
      node.address,
      node.derivedOptions.network
    );
    setNode(node);
    setOverview(overview);
    setUtxos(utxos);
    setIsLoading(false);
  };

  const displayableData = useMemo(() => {
    const chainStats = overview?.chain_stats;
    const mempoolStats = overview?.mempool_stats;
    const confirmedBalance = chainStats
      ? toBtc(chainStats.funded_txo_sum - chainStats.spent_txo_sum)
      : 0;
    const unconfirmedBalance = mempoolStats
      ? toBtc(mempoolStats.funded_txo_sum - mempoolStats.spent_txo_sum)
      : 0;
    const totalBalance = confirmedBalance + unconfirmedBalance;
    return {
      confirmedBalance,
      unconfirmedBalance,
      totalBalance,
      utxos: utxos?.map((utxo) => ({
        ...utxo,
        value: toBtc(utxo.value), // display value in BTC
      })),
    };
  }, [overview, utxos]);

  const mempoolAddressUrl = useMemo(() => {
    switch (node?.derivedOptions.network) {
      case "mainnet":
        return `https://mempool.space/address/${node?.address}`;
      case "testnet4":
        return `https://mempool.space/testnet4/address/${node?.address}`;
      case "easy-regtest":
        return `https://mempool.bitcoin-easy-regtest.com/address/${node?.address}`;
    }
  }, [node]);

  const handleDeleteNode = async () => {
    const result = window.confirm("Are you sure you want to delete this node?");
    if (result) {
      deleteNode(nodeId!);
      navigate(-1);
    }
  };

  const handleCreateTransaction = () => {
    navigate(`/wallet/${walletFile!}/node/${nodeId!}/create-transaction`);
  };

  useEffect(() => {
    loadNode();
  }, []);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (!node) {
    return <div>Wallet not found</div>;
  }

  return (
    <View style={{ padding: "16px" }} gap={24}>
      <View
        direction="row"
        gap={16}
        style={{
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View direction="row" gap={16}>
          <Text type="title" bold>
            📏 Node Information
          </Text>
          <Button
            onClick={handleCreateTransaction}
            text="Create Transaction"
            type="primary"
          />
        </View>
        <Icon
          name="bin"
          width={24}
          height={24}
          color="var(--error)"
          onClick={handleDeleteNode}
        />
      </View>
      <View direction="row" gap={16} style={{ flexWrap: "wrap" }}>
        <View>
          <Text type="label">Address</Text>
          <View direction="row" gap={8}>
            <Text>{node.address}</Text>
            <Icon
              name="copy"
              color="var(--primary)"
              onClick={() => {
                navigator.clipboard.writeText(node.address);
              }}
            />
          </View>
        </View>
        <View>
          <Text type="label">Network</Text>
          <Text>{node.derivedOptions.network}</Text>
        </View>
        <View>
          <Text type="label">Total Balance</Text>
          <Text bold>{displayableData.totalBalance} BTC</Text>
        </View>
        <View>
          <Text type="label">Confirmed Balance</Text>
          <Text>{displayableData.confirmedBalance} BTC</Text>
        </View>
        {displayableData.unconfirmedBalance !== 0 && (
          <View>
            <Text type="label">Unconfirmed Balance</Text>
            <Text>{displayableData.unconfirmedBalance} BTC</Text>
          </View>
        )}
        <View gap={0} style={{ width: "100%" }}>
          <Text type="label">
            In order to see the transaction history any many more you have to
            visit mempool website:
          </Text>
          <a
            href={mempoolAddressUrl}
            target="_blank"
            style={{ fontWeight: "bold", fontSize: 12 }}
          >
            {mempoolAddressUrl}
          </a>
        </View>
      </View>
      <Divider />
      <View gap={16} style={{ width: "100%" }}>
        <View direction="row">
          <Text type="title" bold>
            📃 Usable UTXOs
          </Text>
        </View>
        {displayableData.utxos && displayableData.utxos.length > 0 ? (
          <View direction="row">
            {displayableData.utxos.map((utxo) => (
              <UtxoCard key={utxo.txid} utxo={utxo} type="large" />
            ))}
          </View>
        ) : (
          <Text type="body" style={{ color: "var(--on-surface-variant)" }}>
            No UTXOs available
          </Text>
        )}
      </View>
    </View>
  );
}
