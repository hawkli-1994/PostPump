// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PostPumpToken is ERC20 {
    address public owner;
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10 ** 18; // 1 million tokens

    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        owner = msg.sender;
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner, "Only owner can mint");
        _mint(to, amount);
    }
}