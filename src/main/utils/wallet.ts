import { app, safeStorage } from "electron";
import * as path from "path";
import * as fs from "fs";
import {
  DerivedOptions,
  ReturnedWalletData,
  Signable,
  StoredWalletData,
} from "../../types";
import { Crypto } from "./crypto";
import { HD } from "./hd";

export class Wallet {
  static async store(data: StoredWalletData) {
    const encrypted = safeStorage.encryptString(JSON.stringify(data));
    const file = path.join(app.getPath("userData"), `${Date.now()}.wal`);
    fs.writeFileSync(file, encrypted);
    return file;
  }

  static async getAll() {
    const files = fs
      .readdirSync(app.getPath("userData"))
      .filter((file: string) => file.endsWith(".wal"));

    let wallets: ReturnedWalletData[] = [];
    for (const file of files) {
      const encrypted = fs.readFileSync(
        path.join(app.getPath("userData"), file)
      );
      const decrypted = safeStorage.decryptString(encrypted);
      const { masterKeyEncrypted, ...wallet } = {
        ...(JSON.parse(decrypted) as StoredWalletData),
        file,
      };
      wallets.push(wallet);
    }
    return wallets;
  }

  static async getMasterKeyEncrypted(walletFile: string) {
    const encrypted = fs.readFileSync(
      path.join(app.getPath("userData"), walletFile)
    );
    return (JSON.parse(safeStorage.decryptString(encrypted)) as StoredWalletData).masterKeyEncrypted;
  }

  static async delete(walletFile: string) {
    fs.unlinkSync(path.join(app.getPath("userData"), walletFile));
    return true;
  }

  static async signTransaction<T>(
    walletFile: string,
    derivedPathOptions: DerivedOptions,
    signable: Signable<T>,
    password: string
  ): Promise<T> {
    const encrypted = fs.readFileSync(
      path.join(app.getPath("userData"), walletFile)
    );
    
    const decrypted = safeStorage.decryptString(encrypted);
    const wallet = JSON.parse(decrypted) as StoredWalletData;

    try {
      const masterKey = await Crypto.decrypt(
        wallet.masterKeyEncrypted,
        password
      );
      const derivePath = HD.buildDerivedPath(derivedPathOptions);
      const privateKey = await HD.derivePrivateKey(masterKey, derivePath);
      if (!privateKey) throw new Error("Invalid private key");

      return await signable.signer(privateKey);
    } catch (error) {
      throw new Error("Invalid wallet password");
    }
  }
}
