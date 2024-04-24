import 'arconnect';
import { JWKInterface } from 'arweave/node/lib/wallet.js';
import rsa from 'js-crypto-rsa';

export async function decryptJSONWithArconnect(
  b64EncryptedData: string,
  arweaveWallet: Window['arweaveWallet'],
): Promise<object> {
  //   const encryptedData = Uint8Array.from(atob(b64EncryptedData), (c) =>
  //     c.charCodeAt(0),
  //   );
  const decoder = new TextDecoder('utf-8');

  const decrypted = await arweaveWallet
    // @ts-ignore types package not up to date, this is the correct usage
    .decrypt(b64EncryptedData, { name: 'RSA-OAEP' });
  const decoded = decoder.decode(decrypted as any);

  return JSON.parse(decoded);
}

export async function encryptJSONWithPublicKey(
  obj: object,
  publicKey: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const jsonString = JSON.stringify(obj);
  const byteArray = encoder.encode(jsonString);
  // @ts-ignore
  return rsa.encrypt(byteArray, { kty: 'RSA', n: publicKey, e: 'AQAB' });
}

export async function decryptJSONWithJWK(
  b64EncryptedData: string,
  jwk: JWKInterface,
): Promise<object> {
  //   const encryptedData = atob(b64EncryptedData);
  const decoder = new TextDecoder('utf-8');
  //   const byteArray = Uint8Array.from(encryptedData, (c) => c.charCodeAt(0));
  return rsa.decrypt(b64EncryptedData as any, jwk).then((decrypted) => {
    return JSON.parse(decoder.decode(decrypted));
  });
}
