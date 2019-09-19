import { Client, NetworkType, encodeHex, argAddress, argString } from "orbs-client-sdk";
import { Wallet } from "../../src/wallet/wallet";

async function test(accounts, accountId, name, log) {
    const account = accounts[accountId];
    const addr = await account.getAddress();
    log(`[Account ${accountId}] address`, addr);

    const pubKey = await account.getPublicKey();
    log(`[Account ${accountId}] public key`, encodeHex(pubKey));
    const signature0 = await account.signEd25519(pubKey);
    log(`[Account ${accountId}] signed payload`, encodeHex(signature0));

    const client = new Client("https://node1.demonet.orbs.com/vchains/1000", 1000, NetworkType.NETWORK_TYPE_TEST_NET, account);
    const query = await client.createQuery("NamesV5", "get", [argAddress(addr)]);
    const result = await client.sendQuery(query);
    log(`[Account ${accountId}] name (from NamesV5 contract on Demonet) is`, result.outputArguments[0].value);

    const [ tx, txId ] = await client.createTransaction("NamesV5", "set", [argString(name)]);
    const txResult = await client.sendTransaction(tx);
    log(`[Account ${accountId}] update name`, txResult.executionResult);
}

function log(...contents) {
    const p = document.createElement("p");
    p.textContent = contents.join(" ");
    document.body.appendChild(p);
}

(async () => {
    await new Promise((resolve, reject) => {
        // Waiting for extension to initialize
        setTimeout(resolve, 200);
    })

    const wallet = new Wallet(window);
    const accounts = await wallet.enable();

    await test(accounts, 0, "Iggy Pop", log);
    await test(accounts, 1, "David Bowie", log);
    await test(accounts, 2, "Avril Lavigne", log);
})();