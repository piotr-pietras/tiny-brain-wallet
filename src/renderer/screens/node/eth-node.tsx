import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ReturnedEthereumWalletNode, ReturnedWalletNode } from "../../../types";
import { Loader } from "../../components/Loader";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";
import { NodesPersisterContext } from "../../context/nodesPersister";
import { Divider } from "../../components/Divider";
import { formatEther } from "ethers";
import { Card } from "../../components/Card";

export default function EthNodeScreen() {
  const { walletFile, nodeId } = useParams();
  const { getNode, deleteNode } = useContext(NodesPersisterContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [node, setNode] = useState<ReturnedWalletNode | null>(null);
  const [balance, setBalance] = useState<string>("0");

  const loadNode = async () => {
    const node = getNode(nodeId!) as ReturnedEthereumWalletNode;
    if (!node) throw new Error("Node not found");
    const balance = await window.api.getEthereumBalance(
      node.address,
      node.derivedOptions.network
    );

    setNode(node);
    setBalance(balance);
    setIsLoading(false);
  };

  const etherscanAddressUrl = useMemo(() => {
    switch (node?.derivedOptions.network) {
      case "mainnet":
        return `https://etherscan.io/address/${node?.address}`;
      case "sepolia":
        return `https://sepolia.etherscan.io/address/${node?.address}`;
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
    navigate(
      `/wallet/${walletFile!}/eth-node/${nodeId!}/eth-create-transaction`
    );
  };

  const handleAddEthContract = () => {
    navigate("/add-eth-contract");
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
          <Text bold>{formatEther(BigInt(balance))} ETH</Text>
        </View>
        <View gap={0} style={{ width: "100%" }}>
          <Text type="label">
            In order to see the transaction history any many more you have to
            visit mempool website:
          </Text>
          <a
            href={etherscanAddressUrl}
            target="_blank"
            style={{ fontWeight: "bold", fontSize: 12 }}
          >
            {etherscanAddressUrl}
          </a>
        </View>
      </View>
      <Divider />
      {/* <View direction="row" gap={16}>
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.file}
            wallet={wallet}
            onClick={() => handleWalletClick(wallet.file)}
          />
        ))}
      </View> */}
      <Text type="title" bold>
        📜 Contracts
      </Text>
      <Card
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onClick={handleAddEthContract}
      >
        <Icon
          name="plus"
          width={56}
          height={56}
          color="var(--primary)"
          interactive={false}
        />
        <Text type="label">Add new contract</Text>
      </Card>
    </View>
  );
}
