import { createAccount, DefaultSigner, Account } from "orbs-client-sdk";
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
    console.log(arguments)
    if (type == "call") {
        try {
            wallet[method](...params).then(value => {
                window.wrappedJSObject[callbackName]("response", value);
            }).catch(console.error)
        } catch (e) {
            console.log("Failed to call page code", e);
        }
    }
    
}

exportFunction(onMessage, window, {defineAs: "orbsWalletSendMessage"});

// window.wrappedJSObject.wallet.accounts = cloneInto(
//     accounts,
//     window.wallet.accounts,
//     {cloneFunctions: true});
