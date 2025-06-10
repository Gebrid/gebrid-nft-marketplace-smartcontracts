// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "./ERC20Pausable.sol";

contract GebridToken is ERC20Pausable {
    bool public mintStopped = false;

    constructor() ERC20("Gebrid", "GBRD") {
    }

    function mint(address account, uint256 amount) public onlyOwner returns (bool) {
        require(!mintStopped, "mint is stopped");
        _mint(account, amount);
        return true;
    }

    function stopMint() public onlyOwner {
        mintStopped = true;
    }
}
