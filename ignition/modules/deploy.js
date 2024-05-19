const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ClaimService", (m) => {
    const verifySignature = m.contract("VerifySignature", [], {
        gasPrice: 2_000_000_000,
        maxFeePerGasLimit: 50_000_000_000, // 50 gwei
        maxPriorityFeePerGas: 2_000_000_000, // 2 gwei
    });
    const issuerManagement = m.contract("IssuerManagement", [], {
        gasPrice: 2_000_000_000,
        maxFeePerGasLimit: 50_000_000_000, // 50 gwei
        maxPriorityFeePerGas: 2_000_000_000, // 2 gwei
    });

    return { verifySignature, issuerManagement };
});