import { useCallback, useState } from "react";
import { BitcoinNetwork, PrivateKeyCreationWay, ToStoreWalletData } from "../../types";
import { Ipc } from "../ipc";

const XPRV_BASE58_RE = /^xprv[1-9A-HJ-NP-Za-km-z]{107}$/;

export function useCreateWalletForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [_network, _setNetwork] = useState<BitcoinNetwork>("easy-regtest");
  const [_privateKeyCreationWay, _setPrivateKeyCreationWay] = useState<
    PrivateKeyCreationWay | undefined
  >("mnemonic");
  const [_customMnemonic, _setCustomMnemonic] = useState<string>("");
  const [_password, _setPassword] = useState<string>("");
  const [_mnemonic, _setMnemonic] = useState<string[]>([]);
  const [_masterKey, _setMasterKey] = useState<string>("");

  const setMnemonic = useCallback(
    (word: string, index: number) => {
      _setMnemonic((prev) => {
        const newMnemonic = [...prev];
        newMnemonic[index] = word;
        return newMnemonic;
      });
    },
    [_setMnemonic, _mnemonic]
  );

  const generateMnemonic = useCallback(async () => {
    const mnemonic = await Ipc.generateMnemonic();
    _setMnemonic(mnemonic.split(" "));
  }, [_setMnemonic, _mnemonic]);

  const getPrivateKeyCreationWayOptions = useCallback(() => {
    return [
      "mnemonic",
      "custom mnemonic",
      "masterkey",
    ] as PrivateKeyCreationWay[];
  }, []);

  const validate = useCallback(
    async (name?: string) => {
      const newErrors = new Map<string, string>(Object.entries(errors));

      const checkMasterKey =
        (name === "masterkey" || !name) &&
        _privateKeyCreationWay === "masterkey";
      if (checkMasterKey) {
        if (!XPRV_BASE58_RE.test(_masterKey.trim())) {
          newErrors.set(
            "masterkey",
            "Master key must be a valid Base58 xprv (starts with 'xprv')"
          );
        } else {
          newErrors.delete("masterkey");
        }
      }

      const checkPassword = name === "password" || !name;
      if (checkPassword) {
        if (_password.length < 12) {
          newErrors.set("password", "Password must be at least 12 characters");
        } else {
          newErrors.delete("password");
        }
      }

      setErrors(Object.fromEntries(newErrors));
      if (Object.keys(Object.fromEntries(newErrors)).length > 0) return false;
      return true;
    },
    [_masterKey, _password, _privateKeyCreationWay, errors]
  );

  const get = useCallback(async (): Promise<ToStoreWalletData> => {
    setErrors({});
    const isValid = await validate();
    if (!isValid) {
      throw new Error("Invalid input");
    }

    let creationData: string;
    if (_privateKeyCreationWay === "masterkey") {
      creationData = _masterKey.trim();
    } else if (_privateKeyCreationWay === "custom mnemonic") {
      creationData = _customMnemonic;
    } else {
      creationData = _mnemonic.join(" ");
    }

    return {
      creationWay: _privateKeyCreationWay!,
      creationData,
      password: _password,
    };
  }, [validate, _mnemonic, _password, _customMnemonic, _privateKeyCreationWay]);

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
    mnemonic: _mnemonic,
    setMnemonic: setMnemonic,
    generateMnemonic,
    privateKeyCreationWay: _privateKeyCreationWay,
    setPrivateKeyCreationWay: _setPrivateKeyCreationWay,
    getPrivateKeyCreationWayOptions,
    customMnemonic: _customMnemonic,
    setCustomMnemonic: _setCustomMnemonic,
    masterKey: _masterKey,
    setMasterKey: _setMasterKey,
    password: _password,
    setPassword: _setPassword,
  };
}
