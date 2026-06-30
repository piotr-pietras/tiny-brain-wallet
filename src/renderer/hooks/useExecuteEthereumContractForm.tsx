import { useCallback, useMemo, useState } from "react";
import { StoredEthContract } from "../../types";
import { FunctionFragment } from "ethers/abi";

export function useExecuteEthereumContractForm(
  contract: StoredEthContract,
  selectedFunction: FunctionFragment
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [_inputs, _setInputs] = useState<{ value: string }[]>([]);
  const [_gasPrice, _setGasPrice] = useState<string>("1");

  const overview = useMemo(() => {
    return {
      gasPrice: BigInt(_gasPrice),
    };
  }, [_gasPrice]);

  const validate = useCallback(async () => {
    const newErrors = new Map<string, string>(Object.entries(errors));

    const check = await window.api.checkEthereumContractInputs({
      contract: contract!,
      functionName: selectedFunction.name,
      inputs: _inputs.map((input) => input.value),
    });

    if (!check.valid && check.code == "INVALID_ARGUMENT") {
      newErrors.set(check.argument!, `Invalid argument: ${check.argument}`);
    }

    setErrors(Object.fromEntries(newErrors));
    if (Object.keys(Object.fromEntries(newErrors)).length > 0) return false;
    return true;
  }, [errors, contract, selectedFunction, _inputs]);

  const get = useCallback(async (): Promise<string[]> => {
    setErrors({});
    const isValid = await validate();
    if (!isValid) {
      throw new Error("Invalid input");
    }

    return _inputs.map((input) => input.value);
  }, [validate, _inputs]);

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
    validate,
    errors,
    resetErrors,
    setInputs: _setInputs,
    inputs: _inputs,
    gasPrice: _gasPrice,
    setGasPrice: _setGasPrice,
    overview,
  };
}
