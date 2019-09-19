import { Client, NetworkType, encodeHex, argAddress, argString } from "orbs-client-sdk";
import { Wallet } from "../../src/wallet/wallet";

(async () => {
    await new Promise((resolve, reject) => {
        // Waiting for extension to initialize
        setTimeout(resolve, 200);
    })

    const wallet = new Wallet(window);
    const accounts = await wallet.getAccounts();
    window.accounts = accounts;
    console.log("Accounts", accounts);

    const addr0 = await accounts[0].getAddress();
    console.log("Account 0 address", addr0);

    const pubKey0 = await accounts[0].getPublicKey();
    console.log("Account 0 public key", encodeHex(pubKey0));
    const signature0 = await accounts[0].signEd25519(pubKey0);
    console.log("Account 0 signed payload", encodeHex(signature0));

    const client = new Client("https://node1.demonet.orbs.com/vchains/1000", 1000, NetworkType.NETWORK_TYPE_TEST_NET, accounts[0]);
    const query = await client.createQuery("NamesV5", "get", [argAddress(addr0)]);
    const result = await client.sendQuery(query);
    console.log("Account 0 name (from NamesV5 contract on Demonet) is", result.outputArguments[0].value);

    const [ tx, txId ] = await client.createTransaction("NamesV5", "set", [argString("Kirill")]);
    const txResult = await client.sendTransaction(tx);
    console.log("Updating name status", txResult.executionResult);
})();