// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract IssuerManagement {
    enum Status {
        Active,
        Deactivated
    }

    struct Issuer {
        address issuer;
        Status status;
    }

    address public owner;
    mapping(address => Issuer) public issuers;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier issuerExists(address _issuer) {
        require(issuers[_issuer].issuer != address(0), "Issuer not found");
        _;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getIssuer(address _issuer)
        public
        view
        returns (Issuer memory)
    {
        require(issuers[_issuer].issuer != address(0), "Issuer not found");
        return issuers[_issuer];
    }

    function addIssuer(address _issuer) public onlyOwner {
        require(issuers[_issuer].issuer == address(0), "Issuer already exists");
        issuers[_issuer] = Issuer(_issuer, Status.Active);
    }

    function removeIssuer(address _issuer)
        public
        onlyOwner
        issuerExists(_issuer)
    {
        delete issuers[_issuer];
    }

    function checkActive(address _issuer)
        public
        view
        issuerExists(_issuer)
        returns (bool)
    {
        return issuers[_issuer].status == Status.Active;
    }

    function activateIssuer(address _issuer)
        public
        onlyOwner
        issuerExists(_issuer)
    {
        issuers[_issuer].status = Status.Active;
    }

    function deactivateIssuer(address _issuer)
        public
        onlyOwner
        issuerExists(_issuer)
    {
        issuers[_issuer].status = Status.Deactivated;
    }
}
