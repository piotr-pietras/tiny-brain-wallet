import React, { useEffect, useState } from "react";
import { useCreateWalletForm } from "../../hooks/useCreateWalletForm";
import { Selector } from "../../components/Selector";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import { Divider } from "../../components/Divider";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useNavigate } from "react-router";
import { wordlists } from "bip39";
import { NoteBox } from "../../components/NoteBox";

export default function CreateWalletScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useCreateWalletForm();
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/wallets");
  };

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      const wallet = await form.get();
      await window.api.storeWallet(wallet);
      navigate("/wallets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void form.generateMnemonic();
  }, []);

  return (
    <View style={{ padding: "16px" }}>
      <Text type="title" bold>
        🔑 Wallet private key creation
      </Text>
      <View>
        <Text type="label">
          Select one of the following options to create a wallet private key:
        </Text>
        <View>
          <Selector
            options={form.getPrivateKeyCreationWayOptions()}
            value={form.privateKeyCreationWay}
            onChange={form.setPrivateKeyCreationWay}
          />
          {form.privateKeyCreationWay === "mnemonic" && (
            <>
              <View direction="row" gap={16}>
                {new Array(12).fill(0).map((_, index) => (
                  <Selector
                    style={{ width: "125px" }}
                    options={wordlists.english.map((word) => word)}
                    value={form.mnemonic[index]}
                    onChange={(word) => form.setMnemonic(word, index)}
                  />
                ))}
              </View>
              <Button
                text="Generate mnemonic"
                type="primary"
                onClick={form.generateMnemonic}
              />
            </>
          )}
          {form.privateKeyCreationWay === "custom mnemonic" && (
            <>
              <NoteBox
                text="If you are not aware of dangerous consequences of using a custom mnemonic, please don't use this option. 
                Human are bad at creating randomness and tend to use easy to crack mnemonics.
                Before using this option read carefully about entropy and how to create a secure mnemonic."
                type="warning"
              />
              <NoteBox
                text="The process for seed generation is the same as for the mnemonic way described in BIP39 standard."
                type="info"
              />
              <Input
                style={{ width: "100%" }}
                placeholder="Enter the custom mnemonic"
                multiline={true}
                value={form.customMnemonic}
                onChange={form.setCustomMnemonic}
                form={form}
                name="customMnemonic"
              />
            </>
          )}
          {form.privateKeyCreationWay === "masterkey" && (
            <>
              <Input
                placeholder="Enter the master key"
                value={form.masterKey}
                multiline={true}
                rows={2}
                onChange={form.setMasterKey}
                form={form}
                name="masterKey"
              />
            </>
          )}
        </View>

        <Divider />

        <Text type="title" bold>
          🗝️ Wallet password
        </Text>
        <View>
          <Text type="label">
            This password is only usable to decrypt the wallet's private key of
            wallets created and stored on your machine.
            <br />
            This protects you and gives you time to move funds if unauthorized
            person accesses your machine.
            <br />
            <br />
            If you forget this password you can still recreate the wallet using
            the brain wallet phrase.
          </Text>
          <Input
            placeholder="Enter the wallet's password"
            value={form.password}
            onChange={form.setPassword}
            form={form}
            name="password"
          />
        </View>

        <View direction="row" gap={32} style={{ marginTop: 16 }}>
          <Button text="Cancel  " type="text" onClick={handleCancel} />
          <Button
            loading={isLoading}
            text="Create"
            type="primary"
            onClick={handleCreate}
          />
        </View>
      </View>
    </View>
  );
}
