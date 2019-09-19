import { decodeHex } from "orbs-client-sdk";

class ExtensionProxy {
    constructor(context) {
        this.context = context;
        // should be way more unique
        this.callbackName = `proxyCallback${new Date().getTime()}`;
        this.context[this.callbackName] = this.onMessage.bind(this);

    }

    async sendMessage(id, method, argList) {
        return new Promise((resolve, reject) => {
            // event name should be unique
            this.context.addEventListener(`proxyMessage${id}`, (e) => {
                // console.log("received event", e);
                resolve(e.detail.value);
            })

            this.context.orbsWalletSendMessage({
                callbackName: this.callbackName,
                accountId: id,
                type: "call",
                method: method,
                params: argList,
            });
        })
    }

    onMessage(id, type, value) {
        // console.log(type, value)
        let deserializedValue = value;
        if (type == "Uint8Array") {
            deserializedValue = decodeHex(value);
        }

        let event = new CustomEvent(`proxyMessage${id}`, {
            detail: {
                type, value: deserializedValue
            }
        });
        this.context.dispatchEvent(event);
    }
}

function buildProxy(context, id) {
    const extentionProxy = new ExtensionProxy(context);
    return new Proxy({}, {
        get: (target, property) => {
            return new Proxy(() => {}, {
                apply: (target, thisArg, argList) => {
                    return extentionProxy.sendMessage(id, property, argList);
                }
            })
        },
    })
}

export class Wallet {
    constructor(context) {
        this.context = context;
    }

    async enable() {
        return [buildProxy(this.context, 0), buildProxy(this.context, 1), buildProxy(this.context, 2)];
    }
}