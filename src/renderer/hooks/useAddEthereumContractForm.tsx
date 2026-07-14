import { useCallback, useState } from "react";
import { EthereumNetwork, StoredEthContract } from "../../types";

export function useAddEthereumContractForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [_network, _setNetwork] = useState<EthereumNetwork>("mainnet");
  const [_name, _setName] = useState<string>("");
  const [_address, _setaddress] = useState<string>("");
  const [_abi, _setAbi] = useState<string>("");

  const getNetworkOptions = useCallback((): EthereumNetwork[] => {
    return ["mainnet", "sepolia"] as EthereumNetwork[];
  }, []);

  const validate = useCallback(
    async (name?: string) => {
      const newErrors = new Map<string, string>(Object.entries(errors));
      const checkAddress = name === "address" || !name;
      if (checkAddress) {
        if (!_address) {
          newErrors.set("address", "Contract address is required");
        } else {
          const { valid } = await window.api.isEthereumAddressValid(_address);
          if (!valid) {
            newErrors.set("address", "Invalid contract address");
          }
        }
      }

      const checkName = name === "name" || !name;
      if (checkName) {
        if (!_name) {
          newErrors.set("name", "Contract name is required");
        }
      }

      const checkAbi = name === "abi" || !name;
      if (checkAbi) {
        try {
          await window.api.getEthereumContractFunctions(_abi);
        } catch (error) {
          newErrors.set("abi", "Invalid contract ABI");
        }
      }

      setErrors(Object.fromEntries(newErrors));
      if (Object.keys(Object.fromEntries(newErrors)).length > 0) return false;
      return true;
    },
    [errors, _name, _address, _abi]
  );

  const get = useCallback(async (): Promise<StoredEthContract> => {
    setErrors({});
    const isValid = await validate();
    if (!isValid) {
      throw new Error("Invalid input");
    }

    return {
      network: _network,
      name: _name,
      address: _address,
      abi: _abi,
    };
  }, [_name, _address, _abi, validate]);

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
    getNetworkOptions,
    validate,
    errors,
    resetErrors,
    network: _network,
    setNetwork: _setNetwork,
    name: _name,
    setName: _setName,
    address: _address,
    setAddress: _setaddress,
    abi: _abi,
    setAbi: _setAbi,
  };
}
