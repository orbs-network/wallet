<script>
    export let accounts;
</script>

<style>

</style>

Hello!

{#each accounts as account}
    <p>
    {account.pubKey}
    #await account.getPublicKey()
    <!-- -->
    :then pubKey
    pubKey
    /await
    </p>
{/each}