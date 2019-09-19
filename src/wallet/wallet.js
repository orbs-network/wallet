import { decodeHex } from "orbs-client-sdk";
import * as uuid from "uuid";

class ExtensionProxy {
    constructor(context) {
        this.context = context;
        this.callbackName = `proxyCallback${uuid.v4()}`;
        this.context[this.callbackName] = this.onMessage.bind(this);
    }

    async sendMessage(id, method, argList) {
        const requestId = uuid.v4();
        return new Promise((resolve, reject) => {
            this.context.addEventListener(`proxyMessage-${requestId}`, (e) => {
                // console.log("received event", e);
                resolve(e.detail.value);
            });

            this.context.orbsWalletSendMessage({
                callbackName: this.callbackName,
                requestId: requestId,
                accountId: id,
                type: "call",
                method: method,
                params: argList,
            });
        })
    }

    onMessage(requestId, type, value) {
        // console.log(type, value)
        let deserializedValue = value;
        if (type == "Uint8Array") {
            deserializedValue = decodeHex(value);
        }

        let event = new CustomEvent(`proxyMessage-${requestId}`, {
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