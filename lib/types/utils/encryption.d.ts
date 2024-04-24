import 'arconnect';
import { JWKInterface } from 'arweave/node/lib/wallet.js';
export declare function decryptJSONWithArconnect(b64EncryptedData: string, arweaveWallet: Window['arweaveWallet']): Promise<object>;
export declare function encryptJSONWithArconnect(obj: object, arweaveWallet: Window['arweaveWallet']): Promise<string>;
export declare function encryptJSONWithPublicKey(obj: object, publicKey: string): Promise<string>;
export declare function decryptJSONWithJWK(b64EncryptedData: string, jwk: JWKInterface): Promise<object>;
export declare function encryptJSONWithArweaveSigner(): Promise<void>;
