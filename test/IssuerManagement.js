const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IssuerManagement", function () {

    async function deployIssuerManagementFixture() {
        const IssuerManagement = await ethers.getContractFactory("IssuerManagement");
        const issuerManagement = await IssuerManagement.deploy();
        const [owner, issuer, otherAccount] = await ethers.getSigners();

        return {issuerManagement, owner, issuer, otherAccount};
    }

    describe("Deployment", () => {
        it("Owner Account를 이용해 IssuerManagement 배포에 성공해야 함", async function () {
            const {issuerManagement, owner } = await loadFixture(deployIssuerManagementFixture);
            await issuerManagement.connect(owner);

            expect(issuerManagement.address).to.not.equal(0);
            expect(await issuerManagement.getOwner()).to.equal(owner.address);
        });
    });

    describe("addIssuer", () => {
        it('Owner Account를 이용해 Issuer 등록에 성공해야 함', async () => {
            const { issuerManagement, issuer } = await loadFixture(deployIssuerManagementFixture);

            await issuerManagement.addIssuer(issuer.address);

            expect(
                await issuerManagement.checkActive(issuer.address),
                'Issuer 등록에 실패했습니다.'
            ).to.equal(true);
        });

        it('OtherAccount를 이용해 Issuer 등록에 실패해야 함', async () => {
            const { issuerManagement, issuer, otherAccount } = await loadFixture(deployIssuerManagementFixture);

            const tx = issuerManagement.connect(otherAccount).addIssuer(issuer.address);

           expect(
               tx,
               '다른 계정이 Issuer 등록에 성공했습니다.'
           ).to.be.revertedWith('Only owner can perform this action');

        });

    });

});