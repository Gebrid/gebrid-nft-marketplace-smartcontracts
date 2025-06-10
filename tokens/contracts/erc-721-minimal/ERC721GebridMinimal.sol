// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
pragma abicoder v2;

import "./ERC721BaseMinimal.sol";
import "../IsPrivateCollection.sol";
import "../access/MinterAccessControl.sol";

contract ERC721GebridMinimal is ERC721BaseMinimal, IsPrivateCollection, MinterAccessControl {
    event CreateERC721Gebrid(address owner, string name, string symbol);
    event CreateERC721GebridUser(address owner, string name, string symbol);

    function __ERC721GebridUser_init(string memory _name, string memory _symbol, string memory baseURI, string memory contractURI, address[] memory operators, address transferProxy, address lazyTransferProxy) external virtual {
        __ERC721Gebrid_init_unchained(_name, _symbol, baseURI, contractURI, transferProxy, lazyTransferProxy);

        isPrivate = true;
        emit CreateERC721GebridUser(_msgSender(), _name, _symbol);
    }

    function __ERC721Gebrid_init(string memory _name, string memory _symbol, string memory baseURI, string memory contractURI, address transferProxy, address lazyTransferProxy) external virtual {
        __ERC721Gebrid_init_unchained(_name, _symbol, baseURI, contractURI, transferProxy, lazyTransferProxy);

        isPrivate = false;
        emit CreateERC721Gebrid(_msgSender(), _name, _symbol);
    }

    function __ERC721Gebrid_init_unchained(string memory _name, string memory _symbol, string memory baseURI, string memory contractURI, address transferProxy, address lazyTransferProxy) internal initializer {
        _setBaseURI(baseURI);
        __ERC721Lazy_init_unchained();
        __RoyaltiesV2Upgradeable_init_unchained();
        __Context_init_unchained();
        __ERC165_init_unchained();
        __Ownable_init_unchained();
        __ERC721Burnable_init_unchained();
        __Mint721Validator_init_unchained();
        __MinterAccessControl_init_unchained();
        __HasContractURI_init_unchained(contractURI);
        __ERC721_init_unchained(_name, _symbol);

        //setting default approver for transferProxies
        _setDefaultApproval(transferProxy, true);
        _setDefaultApproval(lazyTransferProxy, true);
    }

    function mintAndTransfer(LibERC721LazyMint.Mint721Data memory data, address to) public override virtual {
        if (isPrivate){
            require(owner() == data.creators[0].account || isMinter(data.creators[0].account), "not owner or minter");
        }
        super.mintAndTransfer(data, to);
    }
}
