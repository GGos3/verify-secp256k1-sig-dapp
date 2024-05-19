const fs = require('fs');
const path = require("path")

async function main () {
    const [deployer, issuer] = await ethers.getSigners();

    console.log("Deploying contracts with the account: ", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    const VerifySignature = await ethers.getContractFactory("VerifySignature");
    const IssuerManagement = await ethers.getContractFactory("IssuerManagement");
    const ClaimStorage = await ethers.getContractFactory("ClaimStorage");

    const verifySignature = await VerifySignature.deploy();
    const issuerManagement = await IssuerManagement.deploy();
    const claimStorage = await ClaimStorage.deploy(
        await verifySignature.getAddress(),
        await issuerManagement.getAddress()
    );

    const verifySignatureAddress = await verifySignature.getAddress();
    const issuerManagementAddress = await issuerManagement.getAddress();
    const claimStorageAddress = await claimStorage.getAddress();

    console.log("VerifySignature address: ", verifySignatureAddress);
    console.log("IssuerManagement address: ", issuerManagementAddress);
    console.log("ClaimStorage address: ", claimStorageAddress);

    const verifySignatureABI = getTheAbi("VerifySignature");
    const issuerManagementABI = getTheAbi("IssuerManagement");
    const claimStorageABI = getTheAbi("ClaimStorage");

    await issuerManagement.addIssuer(await issuer.getAddress(), {
        gasLimit: 100_000,
    });

    // .env 파일 업데이트
    let envConfig = fs.readFileSync('.env', 'utf-8');
    envConfig = envConfig.replace(/VERIFY_SIGNATURE_ADDRESS=.*/, `VERIFY_SIGNATURE_ADDRESS=${verifySignatureAddress}`);
    envConfig = envConfig.replace(/ISSUER_MANAGEMENT_ADDRESS=.*/, `ISSUER_MANAGEMENT_ADDRESS=${issuerManagementAddress}`);
    envConfig = envConfig.replace(/CLAIM_STORAGE_ADDRESS=.*/, `CLAIM_STORAGE_ADDRESS=${claimStorageAddress}`);

    envConfig = envConfig.replace(/VERIFY_SIGNATURE_ABI=.*/, `VERIFY_SIGNATURE_ABI=${verifySignatureABI}`);
    envConfig = envConfig.replace(/ISSUER_MANAGEMENT_ABI=.*/, `ISSUER_MANAGEMENT_ABI=${issuerManagementABI}`);
    envConfig = envConfig.replace(/CLAIM_STORAGE_ABI=.*/, `CLAIM_STORAGE_ABI=${claimStorageABI}`);
    fs.writeFileSync('.env', envConfig);

    console.log('.env file updated successfully');
}

const getTheAbi = (contractName) => {
    try {
        const dir = path.resolve(
            __dirname,
            "../artifacts/contracts/" + contractName + ".sol/" + contractName + ".json"
        )
        const file = fs.readFileSync(dir, "utf8")

        return JSON.stringify(JSON.parse(file).abi);
    } catch (e) {
        console.log(`e`, e)
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });