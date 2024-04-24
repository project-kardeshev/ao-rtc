import Arweave from 'arweave';

import { decryptJSONWithJWK, encryptJSONWithPublicKey } from './encryption.js';

describe('encryption', () => {
  it('should encrypt and decrypt a message', async () => {
    const arweave = Arweave.init({
      host: 'arweave.net',
      port: 443,
      protocol: 'https',
    });

    const hostKey = await arweave.wallets.generate();

    const offer = { blah: 'blah' };
    console.log(hostKey);
    const encrypted = await encryptJSONWithPublicKey(
      offer,
      //'pEdt0ZiNNmyP3HoY-SshCom8ulmbj02jNO_ML9bhxxihAu-C0bGGldsl-Vis4olV80V9Sn0UlDSx7cLxaFD08_z54EGq47OWZS4sRJvCBWPbNOSDkwXsD1ENUSgLB4OXPtlxN8qeowY1o0d3_0KzGlxba2vb8G9sbIzl4yOtGd_nAX1K4QCUaGelR1F31zlOrGrolJVQeNRNf_FgChzIOdQtFkaKOS5zMG0aK3_jJEkCJJ7kUgEZRmYmsWui7faqCZBz74odyD_b45PjobQqI3wqljw9U3WtgFC1ayLAgwwpwI7vwj4Is_0zpexHKp29EZF24sm_KD5WFamrDaPjuplIhlTm59X6jnpz9nNJXKMH4K28ATU6BSdB8IpqzCJKerENrHCTjL9S_OT0Z47bCjd6Dp-WANS2J-QEEgL08KoYqnUvtNA6IZp4HsbG_-tjQa3mp6WoJ7dhOgEf6xwwm7iYDENwH9h-iY0nK0e2R4GVJuN70NKZJDIgLlMtL6NUsX8Td9CWhjHWM0H9lBTevKYgxRbGX_LizWcXsKdAVDBEJqojpZsakjKyWjC4pxL0WjfslZD-sGfGb5Eu-OpA0ZPXgGNT-mek1GahBLCKFfr8yZzcSsUjOskDNFIw-_MkROdZDr-E-AGv4h8yP4eA03ujN9ynV34NH3wXIYjbXo0',
      hostKey.n,
    );
    console.log(encrypted);
    const decrypted = await decryptJSONWithJWK(encrypted, hostKey);

    expect(decrypted).toEqual(offer);
  });
});
