browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    sendResponse(JSON.stringify(message));
});
