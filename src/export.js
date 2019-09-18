import { createAccount, DefaultSigner, Account, encodeHex } from "orbs-client-sdk";
import { get } from "lodash";

export class Wallet {
    constructor() {
        this.accounts = [new DefaultSigner(createAccount())]
    }

    async getAccounts() {
        return this.accounts
    }
}

const wallet = new Wallet();

function onMessage({ type, method, params, callbackName }) {
    if (type == "call") {
        try {
            // wallet.accounts[0][method](...params).then(value => {
            //     window.wrappedJSObject[callbackName]("response", value);
            // }).catch(console.error)

            const value = wallet.accounts[0][method](...params);
            // console.log("val", value)

            let serializedValue = value;
            let type;
            if (get(value, "__proto__.constructor.name") == "Uint8Array") {
                type = "Uint8Array";
                serializedValue = encodeHex(value);
            }
            window.wrappedJSObject[callbackName](type, serializedValue);
        } catch (e) {
            console.log("Failed to call page code", e);
        }
    }
    
}

exportFunction(onMessage, window, {defineAs: "orbsWalletSendMessage"});
