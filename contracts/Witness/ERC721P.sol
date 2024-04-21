// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { IWitness, Proof } from "contracts/IWitness.sol";

contract ERC721P is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private tokenId;
    string public tok = "";
    address WITNESS_CONTRACT_ADD = 0x000000031C0d9df77F390CED953219E561B67089;
    IWitness witContract = IWitness(WITNESS_CONTRACT_ADD);

    mapping(address => bool) public mintedNftOwners;

    constructor(string memory _nftName,string memory _nftSymbol) ERC721(_nftName, _nftSymbol) {}

    function getProvenanceHash(bytes calldata bridgeData) public pure returns (bytes32) {
        return keccak256(bridgeData);
    }

    function getBridgedOwner(bytes calldata bridgeData) public pure returns (address owner) {
        (owner,) = abi.decode(bridgeData, (address, string));
    }

    function string_tobytes(string memory s) public pure returns (bytes memory){
        bytes memory b3 = bytes(s);
        return b3;
    }

    function encodeData(string memory s,address ownerAdd) public pure returns(bytes memory) {
        bytes memory bridgeData = abi.encode(ownerAdd,s);
        //(address owner,) = abi.decode(bridgeData, (address, string));
        return bridgeData;
    }

    function mintProperty(string memory _Name,string memory _Description,address _funcCaller) private returns (uint256) {
        tokenId.increment();
        uint256 newId = tokenId.current();
        string memory str1 = '{"name":"';
        str1 = string.concat(str1,_Name);


        string memory st2 = '","description":"';
        st2 = string.concat(st2,_Description);


        str1 = string.concat(str1,st2);

        string memory str2 = '","image":"https://ipfs.io/ipfs/QmViMZk9NTHsJYG9myS4GsMvpnsSZbZ2MyajizrmW6gQQr"}';
        str1 = string.concat(str1,str2);
        //string memory json = '{"description":"Your Ultimate token of Ownership!","image":"https://ipfs.io/ipfs/QmSmo2Fg8ceao7B7Ni4Uj6BmmK6LBDMbzc8DgFFMWcr68v"}';
        string memory newJson = string.concat("data:application/json;utf8,", str1);
        tok = str1;
        _mint(msg.sender, newId);
        _setTokenURI(newId, newJson);
        safeTransferFrom(msg.sender,_funcCaller, newId);
        mintedNftOwners[_funcCaller] = true;
        return newId;
    }

    function verifyAndMint(bytes calldata bridgeData,
        uint256 leafIndex,
        bytes32[] calldata leftProof,
        bytes32[] calldata rightProof,
        bytes32 targetRoot,
        string memory _name,
        string memory _desc,
        address _funcCaller
    ) public {
        bytes32 bridged = getProvenanceHash(bridgeData);
        witContract.verifyProof(Proof(leafIndex, bridged, leftProof, rightProof, targetRoot));
        // address owner = getBridgedOwner(bridgeData);
        // return owner;
        require(mintedNftOwners[_funcCaller] == false,"You have already your minted NFT");
        mintProperty(_name,_desc,_funcCaller);
    }

    function contractURI(string memory _Name,string memory _Description) public pure returns (string memory) {
        string memory str1 = '{"name":"';
        str1 = string.concat(str1,_Name);


        string memory st2 = '","description":"';
        st2 = string.concat(st2,_Description);


        str1 = string.concat(str1,st2);

        string memory str2 = '","image":"https://ipfs.io/ipfs/QmViMZk9NTHsJYG9myS4GsMvpnsSZbZ2MyajizrmW6gQQr"}';
        str1 = string.concat(str1,str2);
        //string memory json = '{"name":snsName,"description":"Your Ultimate token of Ownership!","image":"https://ipfs.io/ipfs/QmSmo2Fg8ceao7B7Ni4Uj6BmmK6LBDMbzc8DgFFMWcr68v"}';
        //string memory newJson = string.concat("data:application/json;utf8,", json);
        return str1;
    }

    function totalsupply() public view returns (uint256) {
        return tokenId.current();
    }
}