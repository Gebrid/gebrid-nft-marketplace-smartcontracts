// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
pragma abicoder v2;

import "@gebrid/meta-tx/contracts/EIP712MetaTransaction.sol";
import "../ERC1155Base.sol";
import "../../IsPrivateCollection.sol";
import "../../access/MinterAccessControl.sol";

contract ERC1155GebridMeta is ERC1155Base, IsPrivateCollection, MinterAccessControl, EIP712MetaTransaction {
    event CreateERC1155Gebrid(address owner, string name, string symbol);
    event CreateERC1155GebridUser(address owner, string name, string symbol);

    function __ERC1155GebridUser_init(string memory _name, string memory _symbol, string memory baseURI, string memory contractURI, address[] memory operators, address transferProxy, address lazyTransferProxy) external {
        __ERC1155Gebrid_init_unchained(_name, _symbol, baseURI, contractURI, transferProxy, lazyTransferProxy);

        __MetaTransaction_init_unchained("ERC1155GebridUserMeta", "1");

        isPrivate = true;

        emit CreateERC1155GebridUser(_msgSender(), _name, _symbol);
    }

    function __ERC1155Gebrid_init(string memory _name, string memory _symbol, string memory baseURI, string memory contractURI, address transferProxy, address lazyTransferProxy) external {
        __ERC1155Gebrid_init_unchained(_name, _symbol, baseURI, contractURI, transferProxy, lazyTransferProxy);

        __MetaTransaction_init_unchained("ERC1155GebridMeta", "1");

        isPrivate = false;

        emit CreateERC1155Gebrid(_msgSender(), _name, _symbol);
    }

    function _msgSender() internal view virtual override(ContextUpgradeable, EIP712MetaTransaction) returns (address payable) {
        return super._msgSender();
    }

    function __ERC1155Gebrid_init_unchained(string memory _name, string memory _symbol, string memory baseURI, string memory contractURI, address transferProxy, address lazyTransferProxy) internal initializer {
        __Ownable_init_unchained();
        __ERC1155Lazy_init_unchained();
        __ERC165_init_unchained();
        __Context_init_unchained();
        __Mint1155Validator_init_unchained();
        __ERC1155_init_unchained("");
        __HasContractURI_init_unchained(contractURI);
        __ERC1155Burnable_init_unchained();
        __RoyaltiesV2Upgradeable_init_unchained();
        __ERC1155Base_init_unchained(_name, _symbol);
        __MinterAccessControl_init_unchained();
        _setBaseURI(baseURI);

        //setting default approver for transferProxies
        _setDefaultApproval(transferProxy, true);
        _setDefaultApproval(lazyTransferProxy, true);
    }

    function mintAndTransfer(LibERC1155LazyMint.Mint1155Data memory data, address to, uint256 _amount) public override {
        if (isPrivate){
          require(owner() == data.creators[0].account || isMinter(data.creators[0].account), "not owner or minter");
        }
        super.mintAndTransfer(data, to, _amount);
    }
}
