<script>
    import { truncate } from "lodash";
    export let accounts;

    const truncateOptions = {
        omission: "",
        length: 999
    }
</script>

<style>
.container {
    /* width: 100%;
    height: 100%; */
    padding: 10px;
}

.header {
    font-weight: bold;
}

</style>

<div class="container">
<h1>Orbs Wallet Beta</h1>
{#each accounts as account, i}
    <div class="header" alt="{account.address}">Account {i}</div>
    <div class="address" alt="{account.publicKey}">Address {account.address}<!--<button>Copy</button>--></div>
    <div class="address" alt="{account.publicKey}">Public Key {account.publicKey}</div>
{/each}
</div>