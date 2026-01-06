import { Psbt, networks, Network, payments } from "bitcoinjs-lib";
import { Signable, BitcoinTransactionInputs, UtxoMempool } from "../../types";
import { MempoolClient } from "./mempool-client";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";

export interface Output {
  address: string;
  value: number; //satoshi
}

interface Options {
  opReturnData?: string;
  rbf?: boolean;
}

export class BtcTransaction implements Signable<string> {
  private _network: Network = networks.bitcoin;
  private _txHex: string | null = null;
  private _psbt: Psbt | null = null;

  constructor(private readonly mempool: MempoolClient) {}

  async create(inputs: BitcoinTransactionInputs, options?: Options) {
    if (this._txHex)
      throw new Error("Transaction is already done in this instance");

    switch (inputs.wallet.derivedOptions.network) {
      case "mainnet":
        this._network = networks.bitcoin;
        break;
      case "testnet4":
        this._network = networks.testnet;
        break;
      case "easy-regtest":
        this._network = networks.regtest;
        break;
      default:
        throw new Error(`Invalid network: ${this._network}`);
    }

    const vin = await this.prepareP2wpkhInputs(inputs.selectedUtxos);
    const vout = this.prepareOutputs(inputs, options?.opReturnData);
    this._psbt = new Psbt({ network: this._network })
      .addInputs(vin)
      .addOutputs(vout);

    if (options?.rbf) {
      vin.forEach((_, i) => this.psbt?.setInputSequence(i, 0xffffffff - 2));
    }

    return this;
  }

  private async prepareP2wpkhInputs(
    selectedUtxos: Pick<UtxoMempool, "txid" | "vout">[]
  ) {
    try {
      return await Promise.all(
        selectedUtxos.map(async (utxo) => {
          const tx = await this.mempool.getTransaction(utxo.txid);
          return {
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
              script: Buffer.from(tx.vout[utxo.vout].scriptpubkey, "hex"),
              value: tx.vout[utxo.vout].value,
            },
          };
        })
      );
    } catch (error) {
      throw new Error("Error preparing P2WPKH inputs:\n" + error);
    }
  }

  private prepareOutputs(
    inputs: BitcoinTransactionInputs,
    opReturnData?: string
  ): Output[] {
    const exchange =
      inputs.exchange > 0
        ? [
            {
              address: inputs.wallet.address,
              value: inputs.exchange,
            },
          ]
        : [];
    const outputs: Output[] = [
      {
        address: inputs.toAddress,
        value: inputs.amount,
      },
      ...exchange,
    ];

    if (opReturnData) {
      const embed = payments.embed({
        data: [Buffer.from(opReturnData, "utf8")],
      });
      outputs.push({ value: 0, script: embed.output } as any);
    }

    return outputs;
  }

  async signer(privateKey: string) {
    if (!this._psbt) throw new Error("Psbt is not created");
    if (this._txHex) throw new Error("Transaction is already signed");

    const ECPair = ECPairFactory(ecc);
    const buffer = Buffer.from(privateKey, "hex");
    const keys = ECPair.fromPrivateKey(buffer, { network: this._network });
    await this.psbt.signAllInputsAsync(keys);
    this._psbt.finalizeAllInputs();
    this._txHex = this._psbt.extractTransaction().toHex();

    return this._txHex;
  }

  get psbt(): Psbt {
    if (!this._psbt) throw new Error("Psbt is not created");
    return this._psbt;
  }
}
