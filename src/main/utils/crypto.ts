import { Buffer } from "buffer";
import { Encrypted } from "../../types";
import { createHash } from "crypto";
export class Crypto {
  private static async deriveKey(password: string, salt: BufferSource) {
    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100_000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  static async encrypt(text: string, password: string): Promise<Encrypted> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await this.deriveKey(password, salt);

    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(text)
    );

    return {
      salt: Buffer.from(salt).toString("base64"),
      iv: Buffer.from(iv).toString("base64"),
      data: Buffer.from(ciphertext).toString("base64"),
    };
  }

  static async decrypt(encrypted: Encrypted, password: string) {
    const salt = Buffer.from(encrypted.salt, "base64");
    const iv = Buffer.from(encrypted.iv, "base64");
    const data = Buffer.from(encrypted.data, "base64");

    const key = await this.deriveKey(password, salt);

    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return new TextDecoder().decode(plaintext);
  }

  static async sha256(data: string) {
    return createHash("sha256").update(data).digest("hex");
  }
}
