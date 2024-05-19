require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { mnemonic } = require('./secrets.json');
const { task} = require("hardhat/config");

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    localhost: {},
    hardhat: {},
    bsctestnet : {
      url: "https://data-seed-prebsc-1-s3.bnbchain.org:8545",
      chainId: 97,
      // Metamask
      // accounts: {mnemonic: mnemonic},
      gasPrice: 2_000_000_000,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY, process.env.ISSUER_PRIVATE_KEY],
    }
  },
  solidity: "0.8.9",
};
