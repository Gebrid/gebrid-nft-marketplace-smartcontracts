// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
pragma abicoder v2;

import "./ExchangeSimple.sol";

contract ExchangeSimple_1 is ExchangeSimple {
    function getSomething() external pure returns (uint) {
        return 10;
    }
}
