import { DerivedOptions } from "../../types";
import * as bip39 from "bip39";
import * as ecc from "tiny-secp256k1";
import { BIP32Factory } from "bip32";

export class HD {
  static async derivePrivateKey(masterKey: string, derivedPath: string) {
    const bip32 = BIP32Factory(ecc);
    return bip32
      .fromBase58(masterKey)
      .derivePath(derivedPath)
      .privateKey?.toString("hex");
  }

  static async produceMasterKey(mnemonic: string) {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    return bip32.fromSeed(seed).toBase58();
  }

  static buildDerivedPath(options: DerivedOptions) {
    switch (options.blockchain) {
      case "bitcoin":
        switch (options.addressType) {
          case "p2wpkh":
            return `m/84'/0'/${options.account}'/${options.change}/${options.index}`;
          default:
            throw new Error(`Invalid address type: ${options.addressType}`);
        }
      default:
        throw new Error(`Invalid blockchain: ${options.blockchain}`);
    }
  }
}
