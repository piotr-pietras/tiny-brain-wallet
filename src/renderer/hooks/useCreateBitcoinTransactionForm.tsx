import { useCallback, useMemo, useState } from "react";
import {
  BitcoinTransactionInputs,
  ReturnedBitcoinWalletNode,
  ReturnedWalletNode,
  UtxoMempool,
} from "../../types";
import { Ipc } from "../ipc";
import {
  OP_RETURN_HEADER_SIZE,
  OP_RETURN_MAX_SIZE,
  P2WPKH_DUST,
  P2WPKH_HEADER_SIZE,
  P2WPKH_INPUT_SIZE,
  P2WPKH_OUTPUT_SIZE,
} from "../const";

export function useCreateBitcoinTransactionForm(
  wallet: ReturnedBitcoinWalletNode | null
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [numberOfOutputs, setNumberOfOutputs] = useState<number>(2);
  const [_toAddress, _setToAddress] = useState<string>("");
  const [_selectedUtxos, setSelectedUtxos] = useState<UtxoMempool[]>([]);
  const [_amount, _setAmount] = useState<string>("");
  const [_feeRate, _setFeeRate] = useState<string>("1");
  const [_opReturnData, _setOpReturnData] = useState<string>("");

  const isUtxoSelected = useCallback(
    (utxo: UtxoMempool) => {
      return _selectedUtxos.some(
        (u) => u.txid === utxo.txid && u.vout === utxo.vout
      );
    },
    [_selectedUtxos]
  );

  const selectUtxo = useCallback(
    (utxo: UtxoMempool) => {
      setSelectedUtxos((prev) => {
        if (prev.some((u) => u.txid === utxo.txid && u.vout === utxo.vout)) {
          return prev.filter(
            (u) => !(u.txid === utxo.txid && u.vout === utxo.vout)
          );
        }
        return [...prev, utxo];
      });
    },
    [_selectedUtxos]
  );

  const overview = useMemo(() => {
    const balance = _selectedUtxos.reduce((p, c) => p + c.value, 0);
    const opReturnSize =
      _opReturnData.length > 0
        ? OP_RETURN_HEADER_SIZE + new TextEncoder().encode(_opReturnData).length
        : 0;
    const size =
      P2WPKH_HEADER_SIZE +
      _selectedUtxos.length * P2WPKH_INPUT_SIZE +
      P2WPKH_OUTPUT_SIZE * numberOfOutputs +
      opReturnSize;
    const fee = Math.ceil(Number(_feeRate) * size);
    const spendable = balance - fee;
    const exchange = Math.max(spendable - Number(_amount), 0);

    if (spendable - Number(_amount) < P2WPKH_DUST) {
      setNumberOfOutputs(1);
    } else {
      setNumberOfOutputs(2);
    }

    return {
      balance,
      spendable,
      amount: Number(_amount),
      feeRate: Number(_feeRate),
      fee,
      opReturnSize,
      size,
      exchange,
    };
  }, [_selectedUtxos, _feeRate, _amount, numberOfOutputs, _opReturnData]);

  const validate = useCallback(
    async (name?: string) => {
      const newErrors = new Map<string, string>(Object.entries(errors));
      const checkToAddress = name === "toAddress" || !name;
      if (checkToAddress) {
        if (!_toAddress) {
          newErrors.set("toAddress", "Recipient address is required");
        } else {
          const { valid, network } = await Ipc.isBitcoinAddressValid(_toAddress);
          if (!valid || wallet?.derivedOptions.network !== network) {
            newErrors.set("toAddress", "Invalid recipient address");
          }
        }
      }

      const checkFeeRate = name === "feeRate" || !name;
      if (checkFeeRate) {
        if (!_feeRate) {
          newErrors.set("feeRate", "Fee rate is required");
        } else if (Number(_feeRate) < 0.01) {
          newErrors.set("feeRate", "Fee rate must be at least 0.01 sat/byte");
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
        } else if (Number(_amount) < P2WPKH_DUST) {
          newErrors.set(
            "amount",
            "Amount must be greater than the dust amount"
          );
        }
      }

      const checkOpReturnData = name === "opReturnData" || !name;
      if (checkOpReturnData) {
        if (overview.opReturnSize > OP_RETURN_MAX_SIZE) {
          newErrors.set(
            "opReturnData",
            "OP return data must be less than 100000 bytes"
          );
        }
      }

      setErrors(Object.fromEntries(newErrors));
      if (Object.keys(Object.fromEntries(newErrors)).length > 0) return false;
      return true;
    },
    [
      errors,
      _toAddress,
      _amount,
      _feeRate,
      _selectedUtxos,
      _opReturnData,
      overview.spendable,
      overview.opReturnSize,
    ]
  );

  const get = useCallback(async (): Promise<BitcoinTransactionInputs> => {
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
      fee: overview.fee,
      exchange: overview.exchange,
      selectedUtxos: _selectedUtxos,
      opReturnData: _opReturnData ?? undefined,
    };
  }, [wallet, _toAddress, _amount, _feeRate, _selectedUtxos, validate]);

  const setSpendAll = useCallback(async () => {
    const sendAllSize =
      P2WPKH_HEADER_SIZE +
      _selectedUtxos.length * P2WPKH_INPUT_SIZE +
      P2WPKH_OUTPUT_SIZE;
    const sendAllAmount = overview.balance - Number(_feeRate) * sendAllSize;
    _setAmount(Math.max(sendAllAmount, 0).toString());
    resetErrors("amount");
  }, [overview.balance, _feeRate, _selectedUtxos]);

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
    toAddress: _toAddress,
    setToAddress: _setToAddress,
    selectedUtxos: _selectedUtxos,
    selectUtxo,
    isUtxoSelected,
    feeRate: _feeRate,
    setFeeRate: _setFeeRate,
    amount: _amount,
    setAmount: _setAmount,
    opReturnData: _opReturnData,
    setOpReturnData: _setOpReturnData,
  };
}
