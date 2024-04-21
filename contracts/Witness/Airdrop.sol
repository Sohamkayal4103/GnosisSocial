// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "contracts/ERC721P.sol";

contract Airdrop{

    address public deployedAdd;


    function deployNFT(string memory _nftName,string memory _nftSymbol) public returns(address) {
        address cont1 = address(new ERC721P(_nftName,_nftSymbol));
        deployedAdd = cont1;
        return cont1;
    }
}