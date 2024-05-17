const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ClaimStorage", function () {

    async function deployClaimStorageFixture() {
        const IssuerManagement = await ethers.getContractFactory("IssuerManagement");
        const VerifySignature = await ethers.getContractFactory("VerifySignature");
        const ClaimStorage = await ethers.getContractFactory("ClaimStorage");

        const issuerManagement = await IssuerManagement.deploy();
        const verifySignature = await VerifySignature.deploy();
        const claimStorage = await ClaimStorage.deploy(await verifySignature.getAddress(), await issuerManagement.getAddress());

        const [owner, issuer, otherAccount] = await ethers.getSigners();

        await issuerManagement.connect(owner).addIssuer(issuer.address);

        return {claimStorage, issuerManagement, verifySignature, owner, issuer, otherAccount};
    }

    describe("Deploy & Init", () => {
        it("Owner Account를 이용해 ClaimStorage 배포에 성공해야 함", async function () {
            const {claimStorage, owner } = await loadFixture(deployClaimStorageFixture);
            await claimStorage.connect(owner);

            expect(claimStorage.address).to.not.equal(0);
            expect(await claimStorage.getOwner()).to.equal(owner.address);
        });

        it('Owner Account를 이용해 Issuer계정의 Issuer 등록이 되어있어야 함', async () => {
            const { issuerManagement, issuer } = await loadFixture(deployClaimStorageFixture);

            expect(
                await issuerManagement.checkActive(issuer.address),
                'Issuer 등록에 실패했습니다.'
            ).to.equal(true);
        });
    });

    describe("addClaim", () => {
        it('issuer를 이용해 Claim 등록에 성공해야 함', async () => {
            const {claimStorage, verifySignature, issuer, otherAccount} = await loadFixture(deployClaimStorageFixture);

            // Claim 생성
            const message = {
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
            // Claims String 변환 및 Subject(OtherAccount)의 계정으로 Claim 서명
            const claimsString = JSON.stringify(message.claims);
            const claimsHash = ethers.solidityPackedKeccak256(['string'], [claimsString]);
            const claimsSignature = await otherAccount.signMessage(ethers.getBytes(claimsHash));

            console.debug("claimsString: ", claimsString);

            // OtherAccount의 서명 검증
            const result = await verifySignature.verify(otherAccount.address, claimsString, claimsSignature);
            expect(result, "Claims 서명 검증에 실패 했습니다.").to.equal(true);

            // Claims에 OtherAccount의 서명 추가
            message.signature = claimsSignature;

            // message String 변환 및 Issuer의 서명 생성
            const messageString = JSON.stringify(message);
            const messageHash = ethers.solidityPackedKeccak256(['string'], [messageString]);

            const signature = await issuer.signMessage(ethers.getBytes(messageHash));

            // console.debug("messageString: ", messageString);
            // 서명된 OtherAccount의 Claim을 Issuer의 계정으로 서명하고 ClaimStorage에 등록
            const tx = await claimStorage.connect(issuer).addClaim(issuer.address, messageString, signature);

            expect(tx.wait(), "Claim 등록에 실패했습니다.").to.not.be.reverted;
        });
    });
});