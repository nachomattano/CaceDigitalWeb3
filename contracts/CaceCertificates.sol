// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CaceNFT is ERC721URIStorage, Ownable {
   using Counters for Counters.Counter;
   Counters.Counter private _tokenIds;

   constructor() ERC721("CACE", "CACE") {}

   function mintNFT(address _to, string memory _name, string memory _description, string memory _image) public {
       _tokenIds.increment();

       string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name":"', _name , '","description":"', _description , '","image":"', _image, '"}'
                    )
                )
            )
        );

        string memory tokenURI = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

       uint256 newItemId = _tokenIds.current();
       _mint(_to, newItemId);
       _setTokenURI(newItemId, tokenURI);
   }
}