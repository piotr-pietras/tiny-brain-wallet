import { SigningKey, BaseWallet, isAddress } from "ethers";

export class EthAddress {
  static createAddress(privateKey: string) {
    const buffer = Buffer.from(privateKey, "hex");
    const ecPair = new SigningKey(buffer);
    const wallet = new BaseWallet(ecPair);
    return wallet.address;
  }

  static isAddressValid(_address: string): {
    valid: boolean;
  } {
    return { valid: isAddress(_address) };
  }
}
