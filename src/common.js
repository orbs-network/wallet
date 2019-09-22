export function isChrome() {
    return typeof chrome !== "undefined";
}

// only properly works in the content script
export function isFirefox() {
    return typeof exportFunction !== "undefined";
}