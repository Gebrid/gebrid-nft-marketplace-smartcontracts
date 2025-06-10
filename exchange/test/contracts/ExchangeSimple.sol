// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
pragma abicoder v2;

import "../../contracts/ExchangeCore.sol";
import "./SimpleTransferManager.sol";

contract ExchangeSimple is ExchangeCore, SimpleTransferManager {
    function __ExchangeSimple_init(
        address _transferProxy,
        address _erc20TransferProxy
    ) external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __OrderValidator_init_unchained();
        __TransferExecutor_init_unchained(_transferProxy, _erc20TransferProxy);
    }
}
