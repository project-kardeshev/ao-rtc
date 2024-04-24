import 'arconnect';
import rsa from 'js-crypto-rsa';
export async function decryptJSONWithArconnect(b64EncryptedData, arweaveWallet) {
    //   const encryptedData = Uint8Array.from(atob(b64EncryptedData), (c) =>
    //     c.charCodeAt(0),
    //   );
    const decoder = new TextDecoder('utf-8');
    return (arweaveWallet
        // @ts-ignore types package not up to date, this is the correct usage
        .decrypt(b64EncryptedData, { name: 'RSA-OAEP' })
        .then(decoder.decode)
        .then(JSON.parse));
}
export async function encryptJSONWithArconnect(obj, arweaveWallet) {
    const encoder = new TextEncoder();
    const jsonString = JSON.stringify(obj);
    const byteArray = encoder.encode(jsonString);
    // @ts-ignore types package not up to date, this is the correct usage
    return arweaveWallet.encrypt(byteArray, { name: 'RSA-OAEP' }).then(btoa);
}
export async function encryptJSONWithPublicKey(obj, publicKey) {
    const encoder = new TextEncoder();
    const jsonString = JSON.stringify(obj);
    const byteArray = encoder.encode(jsonString);
    // @ts-ignore
    return rsa.encrypt(byteArray, { kty: 'RSA', n: publicKey, e: 'AQAB' });
}
export async function decryptJSONWithJWK(b64EncryptedData, jwk) {
    //   const encryptedData = atob(b64EncryptedData);
    const decoder = new TextDecoder('utf-8');
    //   const byteArray = Uint8Array.from(encryptedData, (c) => c.charCodeAt(0));
    return rsa.decrypt(b64EncryptedData, jwk).then((decrypted) => {
        return JSON.parse(decoder.decode(decrypted));
    });
}
export async function encryptJSONWithArweaveSigner() {
    throw new Error('Not implemented');
}
