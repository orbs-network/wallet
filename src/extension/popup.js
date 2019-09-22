import Popup from "./Popup.svelte";
import { getAccount } from "../accounts";
import { encodeHex } from "orbs-client-sdk";
import { merge } from "lodash";

async function RenderPopup() {
    await new Promise((resolve, reject) => {
        setTimeout(resolve, 100)
    })

    const accounts = [
        getAccount(0),
        getAccount(1),
        getAccount(2)
    ].map(a => merge(a, {
        publicKey: encodeHex(a.publicKey),
        privateKey: encodeHex(a.privateKey)
    }));

    new Popup({
        target: window.document.body,
        props: {
            accounts
        }
    });
}

window.RenderPopup = RenderPopup;

RenderPopup();