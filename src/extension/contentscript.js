import { createAccount, DefaultSigner, encodeHex, decodeHex } from "orbs-client-sdk";
import { get } from "lodash";

class ExtensionSigner extends DefaultSigner {
    constructor(account) {
        super(account);
        this.fields.address = account.address;
    }

    async getAddress() {
        return this.fields.address;
    }
}

function getAccount(id) {
    const PUBLIC_KEY = `sender_public_key_${id}`;
    const PRIVATE_KEY = `sender_private_key_${id}`;
    const ADDRESS = `sender_address_${id}`;

    let account;
    if (!localStorage.getItem(PUBLIC_KEY)) {
        account = createAccount();
        localStorage.setItem(PUBLIC_KEY, encodeHex(account.publicKey));
        localStorage.setItem(PRIVATE_KEY, encodeHex(account.privateKey));
        localStorage.setItem(ADDRESS, account.address);
    } else {
        account = {
            publicKey: decodeHex(localStorage.getItem(PUBLIC_KEY)),
            privateKey: decodeHex(localStorage.getItem(PRIVATE_KEY)),
            address: localStorage.getItem(ADDRESS)
        }
    }

    return new ExtensionSigner(account);
}

export class Wallet {
    constructor() {
        this.accounts = [getAccount(0), getAccount(1), getAccount(2)];
    }

    async getAccounts() {
        return this.accounts;
    }
}

const wallet = new Wallet();

async function onMessage({ type, requestId, accountId, method, params, callbackName }) {
    if (type == "call") {
        try {
            const value = await wallet.accounts[accountId][method](...params);
            let serializedValue = value;
            let returnType;
            if (get(value, "__proto__.constructor.name") == "Uint8Array") {
                returnType = "Uint8Array";
                serializedValue = encodeHex(value);
            }

            window.dispatchEvent(new CustomEvent(`proxyMessage-${requestId}`, {
                detail: JSON.stringify({ requestId, returnType, value: serializedValue })
            }));
        } catch (e) {
            console.log("Failed to call page code", e);
        }
    }
}

// setting up communication from the page to the contentscript
window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window) {
        return;
    }

    onMessage(event.data);
}, false);

// var myPort = browser.runtime.connect({name:"port-from-cs"});
// myPort.postMessage({greeting: "hello from content script"});

// myPort.onMessage.addListener(function(m) {
//   console.log("In content script, received message from background script: ");
//   console.log(m.greeting);
// });
