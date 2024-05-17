// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./VerifySignature.sol";
import "./IssuerManagement.sol";

contract ClaimStorage {

    constructor(address _verifySignatureAddress, address _issuerManagementAddress){
        owner = msg.sender;
        verifyContract = VerifySignature(_verifySignatureAddress);
        issuerManagement = IssuerManagement(_issuerManagementAddress);
    }

    struct Claim {
        address claimer;
        address publisher;
        string claim;
        bytes signature;
    }

    mapping(address => Claim) public claims;

    address public owner;

    VerifySignature public verifyContract;
    IssuerManagement public issuerManagement;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier validIssuer() {
        require(issuerManagement.checkActive(msg.sender), "Issuer not active");
        _;
    }

    modifier validSignature(address _claimer, string memory _claim, bytes memory _signature) {
        require(verifySignature(_claimer, _claim, _signature), "Invalid signature");
        _;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getClaim(
        address _claimer
    ) public view returns (Claim memory) {
        return claims[_claimer];
    }

    function addClaim(
        address _claimer,
        string memory _claim,
        bytes memory _signature
    ) public payable validIssuer validSignature(_claimer, _claim, _signature) {
        claims[msg.sender] = Claim(_claimer, msg.sender, _claim, _signature);
    }

    function verifySignature(
        address _claimer,
        string memory _claim,
        bytes memory _signature
    ) public view returns (bool){
        return verifyContract.verify(_claimer, _claim, _signature);
    }
}
