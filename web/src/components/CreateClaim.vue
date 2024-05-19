<script setup>
import {ref} from "vue";
import {BrowserProvider, Contract, ethers} from "ethers";

const provider = new BrowserProvider(window.ethereum);

const verifySignatureContract = new Contract(
    import.meta.env.VITE_VERIFY_SIGNATURE_ADDRESS,
    import.meta.env.VITE_VERIFY_SIGNATURE_ABI,
    provider
);

const claimType = ref("");
const claimValue = ref("");
const message = ref({
  claims: [],
  signature: "",
});

const verifyResult = ref({success: false, error: ""});
const contractAddress = import.meta.env.VITE_VERIFY_SIGNATURE_ADDRESS;

const addClaim = async () => {
  if (claimType.value && claimValue.value) {
    message.value.claims.push({ClaimType: claimType.value, ClaimValue: claimValue.value});
    claimType.value = "";
    claimValue.value = "";
    verifyResult.value = {success: false, error: ""};
    message.value.signature = await createSignature(message.value.claims);
  }
};

const createSignature = async (claims) => {
  const signer = await provider.getSigner();
  const claimsString = JSON.stringify(claims);
  const claimsHash = ethers.solidityPackedKeccak256(["string"], [claimsString]);

  return await signer.signMessage(ethers.getBytes(claimsHash));
}

const verifySignature = async () => {
  const signer = await provider.getSigner();
  try {
    const result = await verifySignatureContract.verify(
        await signer.getAddress(),
        JSON.stringify(message.value.claims),
        message.value.signature
    );
    verifyResult.value = {success: result, error: ""};
  } catch (error) {
    verifyResult.value = {success: false, error: error.message};
  }
};
</script>

<template>
  <div>
    <label for="claimType">Claim Type:</label>
    <input id="claimType" v-model="claimType" type="text" placeholder="ex) name"/>

    <label for="claimValue">Claim Value:</label>
    <input id="claimValue" v-model="claimValue" type="text" placeholder="ex) Alice"/>

    <button @click="addClaim">Add Claim</button>
    <button @click="verifySignature" :disabled="!message.signature">Verify Signature</button>

    <div v-if="verifyResult.success">
      <span>Secp256k1 서명 검증 성공!</span> <br>
      <a :href="`https://testnet.bscscan.com/address/${contractAddress}`" target="_blank"> 검증에 사용된 컨트랙트 주소: {{ contractAddress }}</a>
    </div>
    <div v-if="!verifyResult.success && verifyResult.error">서명 검증 실패: {{ verifyResult.error }}</div>

    <pre>{{ JSON.stringify(message, null, 2) }}</pre>
  </div>
</template>

<style scoped>
div {
  margin: 20px;
}

label {
  display: block;
  margin-top: 10px;
}

input {
  margin: 5px 0;
}

button {
  display: block;
  margin-top: 10px;
}

pre {
  background: #f4f4f4;
  padding: 10px;
  border: 1px solid #ddd;
  margin-top: 20px;
  overflow: auto;
  white-space: pre-wrap;
}
</style>
