import { decodeHex } from "orbs-client-sdk";
import { isChrome } from "../common";
import * as uuid from "uuid";

class ExtensionProxy {
    constructor(context) {
        this.context = context;

        /**
            Chrome and Firefox use different dispatch mechanisms:
            - Firefox works with callbacks because its security settings disallow passing objects between contexts
            - Chrome disallows calling function directly but allow passing objects to events
        **/

        if (isChrome()) {
            this.context.orbsWalletSendMessage = (payload) => {
                this.context.postMessage(payload, "*");
            }
        } else {
            this.callbackName = `proxyCallback${uuid.v4()}`;
            this.context[this.callbackName] = this.onMessage.bind(this);
        }
    }

    async sendMessage(id, method, argList) {
        const requestId = uuid.v4();
        return new Promise((resolve, reject) => {
            this.context.addEventListener(`proxyMessage-${requestId}`, (e) => {
                const { requestId, returnType, value } = e.detail;
                let deserializedValue = value;
                if (returnType == "Uint8Array") {
                    deserializedValue = decodeHex(value);
                }

                resolve(deserializedValue);
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

    // Used exclusively by Firefox
    onMessage(requestId, returnType, value) {
        let event = new CustomEvent(`proxyMessage-${requestId}`, {
            detail: {
                requestId, returnType, value
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