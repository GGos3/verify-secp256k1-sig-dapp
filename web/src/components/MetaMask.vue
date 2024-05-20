<script setup>
import {onMounted, ref} from "vue";
import {ethers, Wallet} from "ethers";

const accountAddress = ref("");
const accountBalance = ref("");
const issuerAddress = ref("");
const issuerBalance = ref("");

const bscTestnet = {
  chainId: "0x61",
  chainName: "BNB Smart Chain Testnet",
  rpcUrls: ["https://data-seed-prebsc-1-s1.bnbchain.org:8545"],
  nativeCurrency: {
    name: "tBNB",
    symbol: "tBNB",
    decimals: 18
  },
  blockExplorerUrls: [
    "https://testnet.bscscan.com"
  ]
};


let provider = null;
let signer = null;

onMounted(async () => {
  await setup();
})

async function setup() {
  if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults")
    provider = ethers.getDefaultProvider();
    return;
  }

  provider = window.ethereum;
  try {
    await provider
        .request({
          method: "wallet_switchEthereumChain",
          params: [{chainId: "0x61"}],
        });
  } catch (switchError) {
    try {
      await provider
          .request({
            method: "wallet_addEthereumChain",
            params: [
              bscTestnet
            ],
          });
    } catch (e) {
      console.error(e);
    }
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  accountAddress.value = await signer.getAddress();
  accountBalance.value = ethers.formatEther(
      await provider.getBalance(await signer.getAddress())
  );

  const issuer = new Wallet(import.meta.env.VITE_ISSUER_PRIVATE_KEY, provider);
  issuerAddress.value = await issuer.getAddress();
  issuerBalance.value = ethers.formatEther(
      await provider.getBalance(await issuer.getAddress())
  );
}

</script>
<template>
  <div id="account-info">
    <h4 id="address">현재 계정: {{ accountAddress }}</h4>
    <h4 id="balance">잔액: {{ accountBalance }}tBNB</h4>
  </div>
  <div id="account-info">
    <h4 id="address">Issuer 계정: {{ issuerAddress }}</h4>
    <h4 id="balance">잔액: {{ issuerBalance }}tBNB</h4>
  </div>
</template>

<style scoped>
#account-info {
  display: flex;
  flex-direction: column;
  align-items: start;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin: 20px 0;
}

#account-info h4 {
  margin: 10px 0;
  color: #333;
  font-weight: 600;
}
</style>