import 'arconnect';

import {
  decryptJSONWithArconnect,
  encryptJSONWithPublicKey,
} from '../../../lib/esm/utils/encryption.js';
import './App.css';

function App() {
  async function connect() {
    // eslint-disable-next-line

    await window.arweaveWallet.connect([
      'DECRYPT',
      'ENCRYPT',
      'ACCESS_PUBLIC_KEY',
    ]);
  }
  async function testPubEncryptDecrypt() {
    // eslint-disable-next-line

    const pk = await window.arweaveWallet.getActivePublicKey();
    const data = {
      test: 'test',
    };
    const decoder = new TextDecoder('utf-8');
    const encrypted = await encryptJSONWithPublicKey(data, pk);
    console.log(decoder.decode(encrypted));

    /* eslint-disable */
    const decrypt = window.arweaveWallet.decrypt;
    const decrypted = (await decrypt(encrypted, {
      name: 'RSA-OAEP',
    } as any)) as any;
    const decryptedString = decoder.decode(decrypted);
    console.log(decryptedString);
  }
  return (
    <>
      <button onClick={connect}>connect</button>
      <button
        onClick={() => testPubEncryptDecrypt().catch((e) => console.error(e))}
      >
        test
      </button>
    </>
  );
}

export default App;
