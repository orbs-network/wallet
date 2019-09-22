import { DefaultSigner } from "orbs-client-sdk";
import { serialize, deserialize } from "../serialization";
import { getAccount } from "../accounts.js";

class ExtensionSigner extends DefaultSigner {
    constructor(account) {
        super(account);
        this.fields.address = account.address;
    }

    async getAddress() {
        return this.fields.address;
    }
}

export class Wallet {
    constructor() {
        this.accounts = [
            new ExtensionSigner(getAccount(0)),
            new ExtensionSigner(getAccount(1)),
            new ExtensionSigner(getAccount(2)),
        ];
    }

    async getAccounts() {
        return this.accounts;
    }
}

const wallet = new Wallet();

let contentPort;

async function onMessage({ type, requestId, accountId, method, params, source }) {
    if (type == "call") {
        try {
            console.log(`${source}: accounts[${accountId}].${method}(${JSON.stringify(params)})`);
            const value = await wallet.accounts[accountId][method](...(params.map(deserialize)));
            contentPort.postMessage({ type: "callValue", requestId, value: serialize(value) });
        } catch (e) {
            console.log("Failed to call page code", e);
        }
    }
}

function connected(p) {
    contentPort = p;
    contentPort.onMessage.addListener(onMessage);
}

(typeof browser !== "undefined" ? browser : chrome).runtime.onConnect.addListener(connected);
