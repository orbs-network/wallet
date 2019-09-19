import { decodeHex } from "orbs-client-sdk";

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

export class Wallet {
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