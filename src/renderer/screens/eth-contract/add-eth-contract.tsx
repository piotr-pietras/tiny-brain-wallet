import React, { useContext } from "react";
import { View } from "../../components/View";
import { Text } from "../../components/Text";
import { Input } from "../../components/Input";
import { useAddEthereumContractForm } from "../../hooks/useAddEthereumContractForm";
import { NoteBox } from "../../components/NoteBox";
import { Button } from "../../components/Button";
import { useNavigate } from "react-router";
import { EthContractPersisterContext } from "../../context/ethContractPersister";
import { Selector } from "../../components/Selector";

export default function AddEthContractScreen() {
  const form = useAddEthereumContractForm();
  const navigate = useNavigate();
  const { setEthContract } = useContext(EthContractPersisterContext);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleAdd = async () => {
    const isValid = await form.validate();
    if (!isValid) return;

    const ethContract = await form.get();
    setEthContract(ethContract);
    navigate(-1);
  };

  return (
    <View style={{ padding: "16px" }} gap={16}>
      <Text type="title" bold>
        📜 Add Contract
      </Text>
      <View full>
        <View>
          <Text type="label">Network:</Text>
          <Selector
              options={form.getNetworkOptions()}
              value={form.network}
              onChange={form.setNetwork}
          />
        </View>
        <View>
          <Text type="label">Contract Name:</Text>
          <Input
            name="name"
            form={form}
            value={form.name}
            placeholder="Enter the contract name"
            onChange={(value) => {
              form.resetErrors("name");
              form.setName(value);
            }}
          />
        </View>
        <View full>
          <Text type="label">Contract Address:</Text>
          <Input
            name="address"
            form={form}
            value={form.address}
            placeholder="Enter the contract address"
            onChange={(value) => {
              form.resetErrors("address");
              form.setAddress(value);
            }}
          />
        </View>
        <View full>
          <Text type="label">Contract ABI:</Text>
          <NoteBox
            text="The ABI is the interface of the contract. You can get the ABI from Etherscan website."
            type="info"
          />
          <Input
            name="abi"
            form={form}
            value={form.abi}
            style={{ height: "400px" }}
            placeholder="Enter the contract ABI"
            multiline={true}
            onChange={(value) => {
              form.resetErrors("abi");
              form.setAbi(value);
            }}
          />
        </View>
        <View direction="row" gap={32} style={{ marginTop: 16 }}>
          <Button text="Cancel  " type="text" onClick={handleCancel} />
          <Button text="Add" type="primary" onClick={handleAdd} />
        </View>
      </View>
    </View>
  );
}
