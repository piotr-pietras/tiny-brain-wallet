import { useCallback, useMemo, useState } from "react";
import {
  EthereumTransactionInputs,
  ReturnedEthereumWalletNode,
} from "../../types";
import { ETH_TX_GAS_LIMIT } from "../const";

export function useCreateEthereumTransactionForm(
  wallet: ReturnedEthereumWalletNode | null
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [_balance, _setBalance] = useState<bigint>(BigInt(0));
  const [_toAddress, _setToAddress] = useState<string>("");
  const [_amount, _setAmount] = useState<string>("");
  const [_gasPrice, _setGasPrice] = useState<string>("1");

  const overview = useMemo(() => {
    return {
      balance: _balance,
      spendable: _balance - BigInt(_gasPrice) * BigInt(ETH_TX_GAS_LIMIT),
      amount: BigInt(_amount),
      gasPrice: BigInt(_gasPrice),
    };
  }, [_amount, _gasPrice, _balance]);

  const validate = useCallback(
    async (name?: string) => {
      const newErrors = new Map<string, string>(Object.entries(errors));
      const checkToAddress = name === "toAddress" || !name;
      if (checkToAddress) {
        if (!_toAddress) {
          newErrors.set("toAddress", "Recipient address is required");
        } else {
          const { valid } = await window.api.isEthereumAddressValid(_toAddress);
          if (!valid) {
            newErrors.set("toAddress", "Invalid recipient address");
          }
        }
      }

      const checkAmount = name === "amount" || !name;
      if (checkAmount) {
        if (!_amount || Number(_amount) <= 0) {
          newErrors.set(
            "amount",
            "Amount is required and must be greater than 0"
          );
        } else if (!Number.isInteger(Number(_amount))) {
          newErrors.set("amount", "Amount must be a integer");
        } else if (Number(_amount) > overview.spendable) {
          newErrors.set(
            "amount",
            "Amount must be less than the spendable amount"
          );
        }
      }

      setErrors(Object.fromEntries(newErrors));
      if (Object.keys(Object.fromEntries(newErrors)).length > 0) return false;
      return true;
    },
    [errors, _toAddress, _amount, overview.spendable]
  );

  const get = useCallback(async (): Promise<EthereumTransactionInputs> => {
    setErrors({});
    const isValid = await validate();
    if (!isValid) {
      throw new Error("Invalid input");
    }

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    return {
      wallet,
      toAddress: _toAddress,
      amount: overview.amount,
      gasPrice: overview.gasPrice,
    };
  }, [wallet, _toAddress, _amount, _gasPrice, validate]);

  const setSpendAll = useCallback(async () => {
    _setAmount(overview.spendable.toString());
    resetErrors("amount");
  }, [overview.spendable]);

  const resetErrors = useCallback(
    (name?: string) => {
      if (name) {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      } else {
        setErrors({});
      }
    },
    [errors]
  );

  return {
    get,
    setSpendAll,
    validate,
    overview,
    errors,
    resetErrors,
    balance: _balance,
    setBalance: _setBalance,
    toAddress: _toAddress,
    setToAddress: _setToAddress,
    gasPrice: _gasPrice,
    setGasPrice: _setGasPrice,
    amount: _amount,
    setAmount: _setAmount,
  };
}
