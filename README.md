# Wallet Beta

Partial implementation of the [Wallet API](https://github.com/orbs-network/orbs-client-sdk-javascript/issues/20), currently only works in Firefox and Chrome.

To install the extention, use `about:debugging#/runtime/this-firefox` page in Firefox.

Latest build can be found [here](https://orbs-network-releases.s3.amazonaws.com/wallet/beta/latest.tar.gz).

## API

```typescript
interface Signer {
  getPublicKey(): Promise<Uint8Array>;
  signEd25519(data: Uint8Array): Promise<Uint8Array>;
}

interface Account extends Signer {
  getName(): Promise<string>;
  getDescription(): Promise<string>;
  getAddress(): Promise<string>;
  isCompromised(): bool // in case we want to filter out compromised keys
}
```

### Example

```javascript
const wallet = new Wallet(window);
let accounts;
try {
    accounts = await wallet.enable(); // should open a separate extension window that asks for the password
} catch (e) {
    console.log("Could not initialize wallet: " + e.toString());
    throw e;
}

const account = accounts[0];
```

## Building

`npm run build`

## Running the tests

`open ./extension/test/test.html`
