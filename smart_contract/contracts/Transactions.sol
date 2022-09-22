// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

contract Transactions {
  uint256 transactionCount;

  event Transfer(address from, address receiver, uint amount, string message, uint256 timestamp, string keyword);

  struct TransferStruct {
    address sender;
    address receiver;
    uint amount;
    string message;
    uint256 timestamp;
    string keyword;
  }

  TransferStruct[] transactions;

  function addToBlockchain(address payable recevier, uint amount, string memory message, string memory keyword) public {
    transactionCount += 1;
    transactions.push(TransferStruct(msg.sender, recevier, amount, message, block.timestamp, keyword));

    emit Transfer(msg.sender, recevier, amount, message, block.timestamp, keyword);
  }

  function getAllTransactions() public view returns (TransferStruct[] memory) {
    return transactions;
  }

  function getTransactionCount() public view returns (uint256) {
    return transactionCount;
  }
}