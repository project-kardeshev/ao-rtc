"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptJSONWithArweaveSigner = exports.decryptJSONWithJWK = exports.encryptJSONWithPublicKey = exports.encryptJSONWithArconnect = exports.decryptJSONWithArconnect = void 0;
require("arconnect");
const js_crypto_rsa_1 = __importDefault(require("js-crypto-rsa"));
async function decryptJSONWithArconnect(b64EncryptedData, arweaveWallet) {
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
exports.decryptJSONWithArconnect = decryptJSONWithArconnect;
async function encryptJSONWithArconnect(obj, arweaveWallet) {
    const encoder = new TextEncoder();
    const jsonString = JSON.stringify(obj);
    const byteArray = encoder.encode(jsonString);
    // @ts-ignore types package not up to date, this is the correct usage
    return arweaveWallet.encrypt(byteArray, { name: 'RSA-OAEP' }).then(btoa);
}
exports.encryptJSONWithArconnect = encryptJSONWithArconnect;
async function encryptJSONWithPublicKey(obj, publicKey) {
    const encoder = new TextEncoder();
    const jsonString = JSON.stringify(obj);
    const byteArray = encoder.encode(jsonString);
    // @ts-ignore
    return js_crypto_rsa_1.default.encrypt(byteArray, { kty: 'RSA', n: publicKey, e: 'AQAB' });
}
exports.encryptJSONWithPublicKey = encryptJSONWithPublicKey;
async function decryptJSONWithJWK(b64EncryptedData, jwk) {
    //   const encryptedData = atob(b64EncryptedData);
    const decoder = new TextDecoder('utf-8');
    //   const byteArray = Uint8Array.from(encryptedData, (c) => c.charCodeAt(0));
    return js_crypto_rsa_1.default.decrypt(b64EncryptedData, jwk).then((decrypted) => {
        return JSON.parse(decoder.decode(decrypted));
    });
}
exports.decryptJSONWithJWK = decryptJSONWithJWK;
async function encryptJSONWithArweaveSigner() {
    throw new Error('Not implemented');
}
exports.encryptJSONWithArweaveSigner = encryptJSONWithArweaveSigner;
