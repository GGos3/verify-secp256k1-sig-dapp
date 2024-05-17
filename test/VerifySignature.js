const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VerifySignature", function () {
    async function deployVerifySignatureFixture() {
        const VerifySignature = await ethers.getContractFactory("VerifySignature");
        const verifySignature = await VerifySignature.deploy();
        const [owner, otherAccount] = await ethers.getSigners();

        return {verifySignature, owner, otherAccount};
    }

    describe("Deployment", function () {
        it("Should deploy the VerifySignature contract", async function () {
            const {verifySignature} = await loadFixture(deployVerifySignatureFixture);

            expect(verifySignature.address).to.not.equal(0);
        });
    });

    describe("verify", function () {
        it("Contract와 동일한 인코딩을 사용하는지 확인", async function () {
            const { verifySignature } = await loadFixture(deployVerifySignatureFixture);

            const message = "Hello, world!";

            // 메시지 해시 계산
            const localMessageHash = ethers.solidityPackedKeccak256(['string'], [message]);
            const contractMessageHash = await verifySignature.getMessageHash(message);

            // EIP-191을 만족하는 EthSign 메시지 해시 계산
            const ethSignPrefix = "\x19Ethereum Signed Message:\n32";
            const localEthSignedHash = ethers.solidityPackedKeccak256(
                ['string', 'bytes32'],
                [ethSignPrefix, localMessageHash]
            );
            const contractEthSignedHash = await verifySignature.getEthSignedMessageHash(contractMessageHash);

            // 메시지 해시 비교
            expect(
                localMessageHash,
                '메시지 해시가 일치하지 않습니다.'
            ).to.equal(contractMessageHash);

            // EthSign 메시지 해시 비교
            expect(
                localEthSignedHash,
                'EthSign 메시지 해시가 일치하지 않습니다.'
            ).to.equal(contractEthSignedHash);
        });

        it("서명이 정상이라면 true를 반환해야 함", async function () {
            const { verifySignature, owner } = await loadFixture(deployVerifySignatureFixture);

            const message = "Today is a good day!";
            const messageHash = ethers.solidityPackedKeccak256(['string'], [message]);

            // EIP-191을 방식으로 서명
            const signature = await owner.signMessage(ethers.getBytes(messageHash));

            const result = await verifySignature.verify(owner.address, message, signature);
            const invalidResult = await verifySignature.verify(owner.address, message + ":D", signature);

            expect(result, '서명이 유효 하지 않습니다.').to.equal(true);
            expect(invalidResult, '유효 하지 않은 서명이 서명 검증에 성공 했습니다.').to.equal(false);
        });

        it('배열을 String 으로 변환하고 서명하였을 겅우 서명 검증에 성공해야 함', async () => {
            const {verifySignature, otherAccount} = await loadFixture(deployVerifySignatureFixture);

            const claim = {
                claims: [
                    {
                        claimType: 'name',
                        claimValue: 'Alice'
                    }, {
                        claimType: 'email',
                        claimValue: 'Alic@example.com'
                    }
                ],
                signature: ''
            }
            const claimsString = JSON.stringify(claim.claims);
            const claimsHash = ethers.solidityPackedKeccak256(['string'], [claimsString]);

            const claimsSignature = await otherAccount.signMessage(ethers.getBytes(claimsHash));

            const result = await verifySignature.verify(otherAccount.address, claimsString, claimsSignature);

            expect(result, "Claims 서명 검증에 실패 했습니다.").to.equal(true);
        });
    });
});