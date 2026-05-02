import React, { useEffect, useState } from "react";
import { View } from "../../components/View";
import { ReturnedWalletData } from "../../../types";
import { Loader } from "../../components/Loader";
import { WalletCard } from "../../components/WalletCard";
import { Card } from "../../components/Card";
import { Text } from "../../components/Text";
import { Icon } from "../../components/Icon";
import { useNavigate } from "react-router";
import { Ipc } from "../../ipc";

export default function WalletsScreen() {
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<ReturnedWalletData[]>([]);
  const navigate = useNavigate();

  const loadWallets = async () => {
    setLoading(true);
    const wallets = await Ipc.getWallets();
    setWallets(wallets);
    setLoading(false);
  };

  useEffect(() => {
    void loadWallets();
  }, []);

  const handleCreateWallet = () => {
    navigate("/wallet/create");
  };

  const handleWalletClick = (file: string) => {
    navigate(`/wallet/${file}/derive-node`);
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <View style={{ padding: "16px" }} gap={16}>
      <View direction="row" gap={16}>
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.file}
            wallet={wallet}
            onClick={() => handleWalletClick(wallet.file)}
          />
        ))}
      </View>
      <Card
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onClick={handleCreateWallet}
      >
        <Icon
          name="plus"
          width={56}
          height={56}
          color="var(--primary)"
          interactive={false}
        />
        <Text type="label">Create new wallet</Text>
      </Card>
    </View>
  );
}
