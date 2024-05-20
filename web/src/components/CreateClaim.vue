<script setup>
import {onMounted, ref} from "vue";
import {BrowserProvider, Contract, ethers, Wallet} from "ethers";

const provider = new BrowserProvider(window.ethereum);
const issuer = new Wallet(import.meta.env.VITE_ISSUER_PRIVATE_KEY, provider);

const verifySignatureContract = new Contract(
    import.meta.env.VITE_VERIFY_SIGNATURE_ADDRESS,
    import.meta.env.VITE_VERIFY_SIGNATURE_ABI,
    provider
);

const claimStorageContract = new Contract(
    import.meta.env.VITE_CLAIM_STORAGE_ADDRESS,
    import.meta.env.VITE_CLAIM_STORAGE_ABI,
    provider
).connect(issuer);

const claimType = ref("");
const claimValue = ref("");
const message = ref({
  claims: [],
  signature: "",
});
const addClaimParameter = ref({
  issuerAddress: "",
  message: {},
  signature: "",
});
const getClaimResult = ref({});
const waiting = ref(false);

const verifyResult = ref({success: false, error: ""});
const addClaimResult = ref({success: false, error: ""});
const verifySignatureAddress = import.meta.env.VITE_VERIFY_SIGNATURE_ADDRESS;
const claimStorageAddress = import.meta.env.VITE_CLAIM_STORAGE_ADDRESS;

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
};

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

const addClaimRequest = async () => {
  const messageString = JSON.stringify(message.value);
  const messageHash = ethers.solidityPackedKeccak256(["string"], [messageString]);
  const feeData = await provider.getFeeData();
  const signer = await provider.getSigner();

  addClaimParameter.value.issuerAddress = await issuer.getAddress();
  addClaimParameter.value.message = message.value;
  addClaimParameter.value.signature = await issuer.signMessage(ethers.getBytes(messageHash));

  try {
    waiting.value = true;
    const tx = await claimStorageContract.addClaim(
        await signer.getAddress(),
        messageString,
        addClaimParameter.value.signature, {
          gasPrice: feeData.gasPrice,
        }
    );
    await tx.wait();
    waiting.value = false;
    addClaimResult.value = {success: true, error: ""};
  } catch (error) {
    addClaimResult.value = {success: false, error: error.message};
  }

  await getClaim();
};

const getClaim = async () => {
  const signer = await provider.getSigner();
  try {
    const tx = await claimStorageContract.getClaim(
        await signer.getAddress()
    );
    const sortedTx = {
      subject: tx[0],
      issuer: tx[1],
      claim: JSON.parse(tx[2]),
      signature: tx[3]
    };
    getClaimResult.value = sortedTx;
  } catch (error) {
    getClaimResult.value = "해당 계정으로 등록된 Claim이 없습니다.";
  }
};

onMounted(async () => {
  await getClaim();
});
</script>

<template>
  <div>
    <label for="claimType">Claim Type:</label>
    <input id="claimType" v-model="claimType" type="text" placeholder="ex) name"/>

    <label for="claimValue">Claim Value:</label>
    <input id="claimValue" v-model="claimValue" type="text" placeholder="ex) Alice"/>

    <button @click="addClaim">Add Claim</button>
    <button @click="verifySignature" :disabled="!message.signature">Verify Signature</button>
    <button @click="addClaimRequest" :disabled="!message.signature">Add Claim Request</button>

    <div v-if="verifyResult.success">
      <span>Secp256k1 서명 검증 성공!</span> <br>
      <a :href="`https://testnet.bscscan.com/address/${verifySignatureAddress}`" target="_blank"> 사용된 컨트랙트 주소:
        {{ verifySignatureAddress }}</a>
    </div>
    <div v-if="!verifyResult.success && verifyResult.error">서명 검증 실패: {{ verifyResult.error }}</div>

    <div  v-if="waiting">트랜잭션 처리중...</div>
    <div v-if="addClaimResult.success">
      <span>Claim 등록 성공!</span> <br>
      <a :href="`https://testnet.bscscan.com/address/${claimStorageAddress}`" target="_blank"> 사용된 컨트랙트 주소:
        {{ claimStorageAddress }}</a>
    </div>
    <div v-if="!addClaimResult.success && addClaimResult.error">Claim 등록 실패: {{ addClaimResult.error }}</div>

    <h4>Claim</h4>
    <pre>{{ JSON.stringify(message, null, 2) }}</pre>
    <h4>Claim 등록 요청문</h4>
    <pre> {{ JSON.stringify(addClaimParameter, null, 2) }}</pre>
    <h4>컨트랙트에 등록된 Claim</h4>
    <pre> {{ JSON.stringify(getClaimResult, null, 2) }}</pre>
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
