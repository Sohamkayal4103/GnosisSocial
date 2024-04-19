// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DAONFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private tokenId;
    string public tok = "";

    constructor() ERC721("DAO", "DAO") {}

    function mintProperty(string memory _daoName,string memory _daoDescription,address _funcCaller) public returns (uint256) {
        tokenId.increment();
        uint256 newId = tokenId.current();
        string memory str1 = '{"name":"';
        str1 = string.concat(str1,_daoName);


        string memory st2 = '","description":"';
        st2 = string.concat(st2,_daoDescription);


        str1 = string.concat(str1,st2);

        string memory str2 = '","image":"https://ipfs.io/ipfs/QmViMZk9NTHsJYG9myS4GsMvpnsSZbZ2MyajizrmW6gQQr"}';
        str1 = string.concat(str1,str2);
        //string memory json = '{"description":"Your Ultimate token of Ownership!","image":"https://ipfs.io/ipfs/QmSmo2Fg8ceao7B7Ni4Uj6BmmK6LBDMbzc8DgFFMWcr68v"}';
        string memory newJson = string.concat("data:application/json;utf8,", str1);
        tok = str1;
        _mint(msg.sender, newId);
        _setTokenURI(newId, newJson);
        safeTransferFrom(msg.sender,_funcCaller, newId);
        return newId;
    }

    function contractURI(string memory _daoName,string memory _daoDescription) public pure returns (string memory) {
        string memory str1 = '{"name":"';
        str1 = string.concat(str1,_daoName);


        string memory st2 = '","description":"';
        st2 = string.concat(st2,_daoDescription);


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