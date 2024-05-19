<script setup>
import {Contract, ethers, Wallet} from "ethers";

const props = defineProps({
  provider: Object,
})
const provider = props.provider;
const signer = props.provider.getSigners();
const issuer = new Wallet(process.env.ISSUER_PRIVATE_KEY);

const verifySignature = new Contract(process.env.VERIFY_SIGNATURE_ADDRESS, process.env.VERIFY_SIGNATURE_ABI, provider);
const issuerManagement = new Contract(process.env.ISSUER_MANAGEMENT_ADDRESS, process.env.ISSUER_MANAGEMENT_ABI, provider);
const claimStorage = new Contract(process.env.CLAIM_STORAGE_ADDRESS, process.env.CLAIM_STORAGE_ABI, provider);

async function createSignAndVerify(message) {
  const messageString = JSON.stringify(message);
  const messageHash = ethers.solidityPackedKeccak256(['string'], [messageString]);

  const signature = await signer.signMessage(ethers.getBytes(messageHash));

  const result = await verifySignature.verify(await signer.getAddress(), messageString, signature);

  return {
    messageString,
    signature,
    result
  };
}

</script>

<template>

</template>

<style scoped>

</style>