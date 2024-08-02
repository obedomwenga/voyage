// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    uint constant _initial_supply = 10000000000 * (10 ** 18);

    constructor() ERC20("VOY", "VOY") {
        _mint(msg.sender, _initial_supply);
    }
}
