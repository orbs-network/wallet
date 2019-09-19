import { encodeHex, decodeHex, Client, argAddress, NetworkType } from "orbs-client-sdk";

class ExtensionProxy {
    constructor(context) {
        this.context = context;
        // should be way more unique
        this.callbackName = `proxyCallback${new Date().getTime()}`;
        this.context[this.callbackName] = this.onMessage.bind(this);

    }

    async sendMessage(target, argList) {
        return new Promise((resolve, reject) => {
            // event name should be unique
            this.context.addEventListener("message", (e) => {
                // console.log("received event", e);
                resolve(e.detail.value);
            })

            this.context.orbsWalletSendMessage({
                callbackName: this.callbackName,
                type: "call",
                method: target,
                params: argList,
            });
        })
    }

    onMessage(type, value) {
        // console.log(type, value)
        let deserializedValue = value;
        if (type == "Uint8Array") {
            deserializedValue = decodeHex(value);
        }

        let event = new CustomEvent("message", {
            detail: {
                type, value: deserializedValue
            }
        });
        this.context.dispatchEvent(event);
    }
}

class Wallet {
    constructor(context) {
        this.context = context;
    }

    async getAccounts() {
        return [this._getProxy()]
    }

    _getProxy() {
        const extentionProxy = new ExtensionProxy(this.context);
        return new Proxy({}, {
            get: (target, property) => {
                return new Proxy(() => {}, {
                    apply: (target, thisArg, argList) => {
                        return extentionProxy.sendMessage(property, argList);
                    }
                })
            },
        })
    }
}

(async () => {
    await new Promise((resolve, reject) => {
        setTimeout(resolve, 500);
    })

    const wallet = new Wallet(window);
    const accounts = await wallet.getAccounts();
    window.accounts = accounts;
    console.log("Accounts", accounts);

    const pubKey0 = await accounts[0].getPublicKey();
    console.log("Account 0 public key", encodeHex(pubKey0));
    const signature0 = await accounts[0].signEd25519(pubKey0);
    console.log("Account 0 signed payload", encodeHex(signature0));

    const client = new Client("https://node1.demonet.orbs.com/vchains/1000", 1000, NetworkType.NETWORK_TYPE_TEST_NET, accounts[0]);
    const query = await client.createQuery("NamesV5", "get", [argAddress("0x99eb4af1f3b3b8619c7e3d99dc5a13c966f9d6e2")]);
    const result = await client.sendQuery(query);
    console.log(result.outputArguments[0]);
})();