var settingsPort = browser.runtime.connect({ name: "port-from-cs" });

async function onMessage({ type, requestId, accountId, method, params, returnType, value }) {
    if (type == "call") {
        settingsPort.postMessage({ type, requestId, accountId, method, params })
    } else if (type == "callValue") {
        window.dispatchEvent(new CustomEvent(`proxyMessage-${requestId}`, {
            detail: JSON.stringify({ requestId, returnType, value })
        }));
    }
}

// setting up communication from the page to the contentscript
window.addEventListener("message", function (event) {
    // We only accept messages from ourselves
    if (event.source != window) {
        return;
    }

    onMessage(event.data);
}, false);

settingsPort.onMessage.addListener(onMessage);
