// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
pragma abicoder v2;

import "./ExchangeCore.sol";
import "@gebrid/meta-tx/contracts/EIP712MetaTransaction.sol";
import "@gebrid/transfer-manager/contracts/GebridTransferManager.sol";

contract ExchangeMeta is ExchangeCore, GebridTransferManager, EIP712MetaTransaction {
    function __Exchange_init(
        address _transferProxy,
        address _erc20TransferProxy,
        uint newProtocolFee,
        address newDefaultFeeReceiver,
        IRoyaltiesProvider newRoyaltiesProvider
    ) external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __OrderValidator_init_unchained();
        __MetaTransaction_init_unchained("ExchangeMeta", "1");
        __TransferExecutor_init_unchained(_transferProxy, _erc20TransferProxy);
        __GebridTransferManager_init_unchained(newProtocolFee, newDefaultFeeReceiver, newRoyaltiesProvider);
    }

    function _msgSender() internal view virtual override(ContextUpgradeable, EIP712MetaTransaction) returns (address payable) {
        return super._msgSender();
    }

}
