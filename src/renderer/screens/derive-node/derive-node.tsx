import React, { useContext, useMemo, useState } from "react";
import { View } from "../../components/View";
import { useDeriveNodeForm } from "../../hooks/useDeriveNodeForm";
import { Text } from "../../components/Text";
import { Selector } from "../../components/Selector";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/Button";
import { NodesPersisterContext } from "../../context/nodesPersister";
import { Ipc } from "../../ipc";
import { EnterPasswordModal } from "../../modals/enter-password";
import { Divider } from "../../components/Divider";
import { NodeCard } from "../../components/NodeCard";
import { DerivedOptions } from "../../../types";
import { Icon } from "../../components/Icon";

export default function DeriveNodeScreen() {
  const { walletFile } = useParams();
  const navigate = useNavigate();
  const form = useDeriveNodeForm();
  const { setNode, getNodeId, getNodes } = useContext(NodesPersisterContext);
  const [showEnterPasswordModal, setShowEnterPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentNodes = useMemo(
    () => getNodes(walletFile!),
    [walletFile, getNodes]
  );

  const handleDeriveNode = async (password?: string) => {
    try {
      setIsLoading(true);
      const derivedOptions = await form.get();
      let nodeId = await getNodeId(walletFile!, derivedOptions);
      if (!nodeId && password) {
        const newNode = await Ipc.getWalletNode(
          walletFile!,
          password,
          derivedOptions
        );
        if (!newNode) throw new Error("Failed to derive node");
        setNode(newNode);
      } else if (!nodeId && !password) {
        setShowEnterPasswordModal(true);
        return;
      }
      nodeId = await getNodeId(walletFile!, derivedOptions);
      switch (derivedOptions.blockchain) {
        case "bitcoin":
          navigate(`/wallet/${walletFile}/btc-node/${nodeId}`);
          break;
        case "ethereum":
          navigate(`/wallet/${walletFile}/eth-node/${nodeId}`);
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = async (derivedOptions: DerivedOptions) => {
    const nodeId = await getNodeId(walletFile!, derivedOptions);
    switch (derivedOptions.blockchain) {
      case "bitcoin":
        navigate(`/wallet/${walletFile}/btc-node/${nodeId}`);
        break;
      case "ethereum":
        navigate(`/wallet/${walletFile}/eth-node/${nodeId}`);
        break;
    }
  };

  const handleDeleteWallet = async () => {
    const result = window.confirm(
      "Are you sure you want to delete this wallet?"
    );
    if (result) {
      await Ipc.deleteWallet(walletFile!);
      navigate("/");
    }
  };

  return (
    <>
      {showEnterPasswordModal && (
        <EnterPasswordModal
          onCancel={() => setShowEnterPasswordModal(false)}
          onAccept={(password) => handleDeriveNode(password)}
        />
      )}
      <View style={{ padding: "16px" }}>
        <View
          direction="row"
          gap={16}
          style={{
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text type="title" bold>
            🔗 Derive Node
          </Text>
          <Icon
            name="bin"
            width={24}
            height={24}
            color="var(--error)"
            onClick={handleDeleteWallet}
          />
        </View>
        <View direction="row" gap={16}>
          <View>
            <Text type="label">Select the blockchain:</Text>
            <Selector
              disabled={isLoading}
              options={form.getBlockchainOptions()}
              value={form.blockchain}
              onChange={form.setBlockchain}
            />
          </View>
          <View>
            <Text type="label">Select the network:</Text>
            <Selector
              disabled={isLoading}
              options={form.getNetworkOptions()}
              value={form.network}
              onChange={form.setNetwork}
            />
          </View>
        </View>
        <View direction="row" gap={16}>
          <View>
            <Text type="label">Select the account:</Text>
            <Selector
              disabled={isLoading}
              options={new Array(100)
                .fill(0)
                .map((_, index) => index.toString())}
              value={form.account}
              onChange={form.setAccount}
            />
          </View>
          <View>
            <Text type="label">Select the change:</Text>
            <Selector
              disabled={isLoading}
              options={new Array(2).fill(0).map((_, index) => index.toString())}
              value={form.change}
              onChange={form.setChange}
            />
          </View>
        </View>
        <View direction="row" gap={16}>
          <View>
            <Text type="label">Select the index:</Text>
            <Selector
              disabled={isLoading}
              options={new Array(100)
                .fill(0)
                .map((_, index) => index.toString())}
              value={form.index}
              onChange={form.setIndex}
            />
          </View>
        </View>
        <View direction="row" gap={32} style={{ marginTop: 16 }}>
          <Button
            loading={isLoading}
            text="Derive Node"
            type="primary"
            onClick={() => handleDeriveNode()}
          />
        </View>
        {currentNodes.length > 0 && (
          <>
            <Divider />
            <View>
              <Text type="title" bold>
                ⛓️ Nodes
              </Text>
              <View direction="row" gap={16}>
                {currentNodes.map((node) => (
                  <NodeCard
                    key={node.derivedPath}
                    node={node}
                    onClick={() => handleNodeClick(node.derivedOptions)}
                  />
                ))}
              </View>
            </View>
          </>
        )}
      </View>
    </>
  );
}
