import Popup from "./Popup.svelte";

async function RenderPopup() {
    await new Promise((resolve, reject) => {
        setTimeout(resolve, 100)
    })
    new Popup({
        target: window.document.body,
        props: {
            accounts: [
                { pubKey: 123 }
            ]
        }
    });
}

window.RenderPopup = RenderPopup;

RenderPopup();