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

            if (isFirefox()) {
                window.wrappedJSObject[callbackName](requestId, returnType, serializedValue);
            } else if (isChrome()) {
                console.log("To be done: chrome code", arguments);
            }
        } catch (e) {
            console.log("Failed to call page code", e);
        }
    }
}

function isChrome() {
    return typeof chrome !== "undefined";
}

function isFirefox() {
    return typeof exportFunction !== "undefined";
}

if (isFirefox()) {
    exportFunction(onMessage, window, {defineAs: "orbsWalletSendMessage"});
}

if (isChrome()) {
    console.log("this is chrome")
    var port = chrome.runtime.connect();

    window.addEventListener("message", function(event) {
        // We only accept messages from ourselves
        if (event.source != window)
            return;

        if (event.data.type && (event.data.type == "FROM_PAGE")) {
            console.log("Content script received: " + event.data.text);
            port.postMessage(event.data.text);
        }
    }, false);
}
