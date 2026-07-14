import React, { useContext, useEffect, useState } from "react";
import { View } from "../../components/View";
import { Text } from "../../components/Text";
import { Button } from "../../components/Button";
import { useNavigate, useParams } from "react-router";
import { EthContractPersisterContext } from "../../context/ethContractPersister";
import { ethers } from "ethers";
import { Loader } from "../../components/Loader";
import { toEth, toGwei } from "../../helpers/unit";
import {
  ReturnedEthereumWalletNode,
  StoredEthContractWithId,
} from "../../../types";
import { Input } from "../../components/Input";
import { unwrapIpcError } from "../../helpers/unwrapIpcError";
import { useExecuteEthereumContractForm } from "../../hooks/useExecuteEthereumContractForm";
import { Icon } from "../../components/Icon";
import { EnterPasswordModal } from "../../modals/enter-password";
import { NodesPersisterContext } from "../../context/nodesPersister";
import { Selector } from "../../components/Selector";
import { ETH_TX_GAS_LIMIT } from "../../const";
import { NoteBox } from "../../components/NoteBox";
import { TransactionResultModal } from "../../modals/transaction-result";
import { ContractCallResultModal } from "../../modals/contract-call-result";

export default function ExecuteEthContractScreen() {
  const navigate = useNavigate();
  const { contractId, nodeId } = useParams();
  const { getNode } = useContext(NodesPersisterContext);
  const [isLoading, setIsLoading] = useState(true);

  const [showSignTransactionModal, setShowSignTransactionModal] =
    useState(false);
  const [showCallResultModal, setShowCallResultModal] = useState(false);
  const [showEnterPasswordModal, setShowEnterPasswordModal] = useState(false);
  const { getEthContract, deleteEthContract } = useContext(
    EthContractPersisterContext
  );
  const [node, setNode] = useState<ReturnedEthereumWalletNode | null>(null);
  const [contract, setContract] = useState<StoredEthContractWithId | null>(
    null
  );
  const [txId, setTxId] = useState<string | null>(null);
  const [functions, setFunctions] = useState<ethers.FunctionFragment[]>([]);
  const [selectedFunction, setSelectedFunction] =
    useState<ethers.FunctionFragment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useExecuteEthereumContractForm(contract!, selectedFunction!);

  const [callResult, setCallResult] = useState<string | null>(null);
  const [callErrorMessage, setCallErrorMessage] = useState<string | null>(null);
  const [estimateGas, setEstimateGas] = useState<string | null>(null);

  const mutabilityIcon = (mutability: string) => {
    switch (mutability) {
      case "nonpayable":
        return "🧬";
      case "payable":
        return "💰";
      case "pure":
        return "👁️";
      case "view":
        return "👁️";
      default:
        return "❓";
    }
  };

  const loadContractAndNode = async () => {
    const contract = getEthContract(contractId!);
    if (!contract) throw new Error("Contract not found");
    const functions = await window.api.getEthereumContractFunctions(
      contract.abi
    );
    if (!functions) throw new Error("Failed to get contract functions");
    setContract(contract);
    setFunctions(functions);
    if (functions.length > 0) setSelectedFunction(functions[0]);

    const node = getNode(nodeId!) as ReturnedEthereumWalletNode;
    if (!node) throw new Error("Node not found");
    setNode(node);

    setIsLoading(false);
  };

  const handleSelectFunction = (name: string) => {
    const func = functions.find((func) => func.name === name);
    if (!func) return;
    setSelectedFunction(func);
    form.setInputs([]);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleDeleteContract = () => {
    const result = window.confirm(
      "Are you sure you want to delete this contract?"
    );
    if (result) {
      deleteEthContract(contractId!);
      navigate(-1);
    }
  };

  const handleCall = async () => {
    const isValid = await form.validate();
    if (!isValid) return;

    try {
      setIsLoading(true);
      const result = await window.api.callEthereumContract({
        contract: contract!,
        functionName: selectedFunction!.name,
        inputs: await form.get(),
      });
      setCallResult(result);
    } catch (error) {
      setCallErrorMessage(unwrapIpcError(error));
    } finally {
      setShowCallResultModal(true);
      setIsLoading(false);
    }
  };

  const handleSign = async (password: string) => {
    const inputs = await form.get();
    try {
      const gasLimit = await window.api.estimateEthereumGas(node!, {
        contract: contract!,
        functionName: selectedFunction!.name,
        inputs,
      });
      const result = await window.api.mutateEthereumContract(
        {
          wallet: node!,
          amount: BigInt(0),
          gasPrice: BigInt(form.gasPrice),
          gasLimit: BigInt(gasLimit),
        },
        {
          contract: contract!,
          functionName: selectedFunction!.name,
          inputs,
        },
        password
      );
      setErrorMessage("");
      setTxId(result);
    } catch (error) {
      setErrorMessage(unwrapIpcError(error));
    } finally {
      setShowSignTransactionModal(true);
      setShowEnterPasswordModal(false);
    }
  };

  const handleMutate = async () => {
    const isValid = await form.validate();
    if (!isValid) return;

    setShowEnterPasswordModal(true);
  };

  const handleDone = () => {
    setShowCallResultModal(false);
    setShowSignTransactionModal(false);
    setShowEnterPasswordModal(false);
    setCallResult(null);
    setCallErrorMessage(null);
    setEstimateGas(null);
    if (txId && !errorMessage) {
      setTxId(null);
      navigate(-1);
    }
  };

  const handleEstimateGas = async () => {
    try {
      const result = await window.api.estimateEthereumGas(node!, {
        contract: contract!,
        functionName: selectedFunction!.name,
        inputs: await form.get(),
      });
      setEstimateGas(BigInt(result).toString());
    } catch (error) {
      setCallErrorMessage(unwrapIpcError(error));
      setShowCallResultModal(true);
    }
  };

  useEffect(() => {
    loadContractAndNode();
  }, []);

  useEffect(() => {
    if (selectedFunction) {
      form.resetErrors();
      form.setInputs(selectedFunction.inputs.map(() => ({ value: "" })));
    }
  }, [selectedFunction]);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <>
      {showSignTransactionModal && (
        <TransactionResultModal
          onDone={handleDone}
          node={node!}
          txId={txId}
          errorMessage={errorMessage}
        />
      )}
      {showCallResultModal && (
        <ContractCallResultModal
          onDone={handleDone}
          result={callResult}
          errorMessage={callErrorMessage}
        />
      )}
      {showEnterPasswordModal && (
        <EnterPasswordModal
          onCancel={() => setShowEnterPasswordModal(false)}
          onAccept={handleSign}
          errorMessage={errorMessage}
        />
      )}
      <View style={{ padding: "16px" }} gap={16}>
        <View
          direction="row"
          gap={16}
          full
          style={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text type="title" bold>
            Call Ethereum Contract
          </Text>
          <Icon
            name="bin"
            color="var(--error)"
            onClick={handleDeleteContract}
          />
        </View>
        <View gap={0}>
          <Text type="label" bold>
            name: {contract?.name}
          </Text>
          <Text type="label" bold>
            network: {contract?.network}
          </Text>
          <Text type="label" bold>
            address: {contract?.address}
          </Text>
        </View>

        <NoteBox
          text="Payable functions are not supported yet. You can choose from view / pure / nonpayable functions."
          type="info"
        />
        <Selector
          options={functions
            // TODO: add payable functions
            .filter((func) => func.stateMutability !== "payable")
            .map((func) => func.name)}
          value={selectedFunction?.name}
          onChange={handleSelectFunction}
        />

        {selectedFunction && (
          <View gap={16} full>
            <View direction="row">
              <Text type="title" bold>
                {mutabilityIcon(selectedFunction.stateMutability)}
                {selectedFunction.stateMutability}
              </Text>
            </View>

            <View full>
              {selectedFunction.inputs.map((input, index) => (
                <View direction="row" full>
                  <Text type="label">{input.name}</Text>
                  <Input
                    name={input.name}
                    value={form.inputs[index]?.value ?? ""}
                    placeholder={input.type}
                    form={form}
                    onChange={(value) => {
                      const newInputs = [...form.inputs];
                      newInputs[index] = { value };
                      form.setInputs(newInputs);
                    }}
                  />
                </View>
              ))}
              {form.errors["global"] && (
                <Text type="label" style={{ color: "var(--error)" }}>
                  {form.errors["global"]}
                </Text>
              )}
            </View>

            {selectedFunction.stateMutability === "nonpayable" && (
              <View>
                <Text type="label">Gas price (wei):</Text>
                <Input
                  type="number"
                  value={form.gasPrice}
                  onChange={form.setGasPrice}
                  form={form}
                  name="gasPrice"
                />
                <Text type="label">
                  📌 equals to {toGwei(form.overview.gasPrice)} Gwei
                </Text>

                {estimateGas && (
                  <>
                    <Text type="label">
                      💸 Fee:
                      {toEth(
                        form.overview.gasPrice * BigInt(ETH_TX_GAS_LIMIT)
                      )}{" "}
                      ETH
                    </Text>
                    <Text type="label">
                      🧯 Estimated gas:
                      {toGwei(BigInt(estimateGas))} Gwei
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>
        )}

        <View direction="row" gap={32} style={{ marginTop: 16 }}>
          <Button text="Cancel  " type="text" onClick={handleCancel} />
          {(() => {
            switch (selectedFunction?.stateMutability) {
              case "view":
              case "pure":
                return (
                  <Button
                    loading={isLoading}
                    text="Call"
                    type="primary"
                    onClick={handleCall}
                  />
                );
              case "nonpayable":
                return (
                  <>
                    <Button
                      loading={isLoading}
                      text="Mutate"
                      type="primary"
                      onClick={handleMutate}
                    />
                    <Button
                      loading={isLoading}
                      text="Estimate Gas & Check Validity"
                      type="text"
                      onClick={handleEstimateGas}
                    />
                  </>
                );
            }
          })()}
        </View>
      </View>
    </>
  );
}
