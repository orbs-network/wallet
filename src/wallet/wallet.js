import { deserialize, serialize } from "../serialization";
import * as uuid from "uuid";

class ExtensionProxy {
    constructor(context) {
        this.context = context;
    }

    async sendMessage(id, method, argList) {
        const requestId = uuid.v4();
        return new Promise((resolve, reject) => {
            this.context.addEventListener(`proxyMessage-${requestId}`, (e) => {
                const { requestId, value } = JSON.parse(e.detail);
                resolve(deserialize(value));
            });

            this.context.postMessage({
                callbackName: this.callbackName,
                requestId: requestId,
                accountId: id,
                type: "call",
                method: method,
                params: (argList || []).map(serialize),
            }, "*");
        })
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