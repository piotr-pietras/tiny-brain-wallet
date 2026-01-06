import { Network, networks, payments, address } from "bitcoinjs-lib";
import { BitcoinNetwork } from "../../types";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";

export class BtcAddress {
  static createP2wpkh(privateKey: string, _network: BitcoinNetwork) {
    let network: Network = networks.bitcoin;

    switch (_network) {
      case "mainnet":
        network = networks.bitcoin;
        break;
      case "testnet4":
        network = networks.testnet;
        break;
      case "easy-regtest":
        network = networks.regtest;
        break;
      default:
        throw new Error(`Invalid network: ${network}`);
    }

    const ECPair = ECPairFactory(ecc);
    const buffer = Buffer.from(privateKey, "hex");
    const keys = ECPair.fromPrivateKey(buffer, { network });
    const address = payments.p2wpkh({
      pubkey: keys.publicKey,
      network,
    }).address;

    if (!address) throw new Error("Failed to create P2WPKH address");
    return address;
  }

  static isAddressValid(_address: string): {
    valid: boolean;
    network?: BitcoinNetwork;
  } {
    try {
      const { prefix } = address.fromBech32(_address);
      if (prefix === "bc") {
        return { valid: true, network: "mainnet" };
      } else if (prefix === "tb") {
        return { valid: true, network: "testnet4" };
      } else if (prefix === "bcrt") {
        return { valid: true, network: "easy-regtest" };
      } else {
        return { valid: false };
      }
    } catch (_) {
      return { valid: false };
    }
  }
}
