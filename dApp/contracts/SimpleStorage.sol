pragma solidity ^0.5.0;

contract SimpleStorage {
  string ipfsHash;


  mapping(uint => string) public listaHashes;

  uint public hashesCount;

  function set(string memory x) public {
    ipfsHash = x;
  }

  function get() public view returns (string memory) {
    return ipfsHash;
  }

  function addHash(string  memory _hash) public {
    hashesCount++;
    listaHashes[hashesCount] = _hash;
  }
}
