async function main () {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account: ", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    const VerifySignature = await ethers.getContractFactory("VerifySignature");
    const verifySignature = await VerifySignature.deploy();

    console.log("VerifySignature address: ", verifySignature.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });