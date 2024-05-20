<script setup>
import MetaMask from "@/components/MetaMask.vue";

const verifySignatureAddress = import.meta.env.VITE_VERIFY_SIGNATURE_ADDRESS;
const issuerManagementAddress = import.meta.env.VITE_ISSUER_MANAGEMENT_ADDRESS;
const claimStorageAddress = import.meta.env.VITE_CLAIM_STORAGE_ADDRESS;
</script>

<template>
  <div>
    <h3>배포된 컨트랙트</h3>
    <a :href="`https://testnet.bscscan.com/address/${verifySignatureAddress}`" target="_blank">VerifySignature Contract</a>
    <a :href="`https://testnet.bscscan.com/address/${issuerManagementAddress}`" target="_blank">IssuerManagement Contract</a>
    <a :href="`https://testnet.bscscan.com/address/${claimStorageAddress}`" target="_blank">ClaimStorage Contract</a>
  </div>
  <MetaMask></MetaMask>
</template>

<style scoped>
div {
  margin: 20px;
  padding: 10px;
}

h1, h3 {
  color: #333;
  font-family: 'Arial', sans-serif;
}

p {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
}

a {
  display: block; /* 링크들이 각각 줄바꿈되도록 설정 */
  margin-bottom: 8px; /* 링크 사이의 거리를 조정 */
  color: #007bff; /* 링크 색상 */
  text-decoration: none; /* 밑줄 제거 */
  font-weight: bold; /* 글씨 굵기 */
}

a:hover {
  color: #0056b3; /* 링크에 마우스를 올렸을 때 색상 */
  text-decoration: underline; /* 밑줄 표시 */
}

/* 배포된 컨트랙트 섹션 스타일링 */
div:nth-child(2) {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 5px;
}

</style>