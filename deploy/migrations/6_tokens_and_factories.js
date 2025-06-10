const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const contract = require("@truffle/contract");
const adminJson = require("@openzeppelin/upgrades-core/artifacts/ProxyAdmin.json")
const ProxyAdmin = contract(adminJson)
ProxyAdmin.setProvider(web3.currentProvider)

const { getProxyImplementation, getSettings } = require("./config.js")

const ERC721Gebrid = artifacts.require('ERC721Gebrid');
const ERC721GebridBeacon = artifacts.require('ERC721GebridBeacon');
const ERC1155Gebrid = artifacts.require('ERC1155Gebrid');
const ERC1155GebridBeacon = artifacts.require('ERC1155GebridBeacon');
const ERC1155GebridBeaconMeta = artifacts.require('ERC1155GebridBeaconMeta');

const TransferProxy = artifacts.require('TransferProxy');
const ERC721LazyMintTransferProxy = artifacts.require('ERC721LazyMintTransferProxy');
const ERC1155LazyMintTransferProxy = artifacts.require('ERC1155LazyMintTransferProxy');

const ERC1155GebridMeta = artifacts.require('ERC1155GebridMeta');

module.exports = async function (deployer, network) {
  const transferProxy = (await TransferProxy.deployed()).address;
  const erc721LazyMintTransferProxy = (await ERC721LazyMintTransferProxy.deployed()).address;
  const erc1155LazyMintTransferProxy = (await ERC1155LazyMintTransferProxy.deployed()).address;

  const { deploy_meta, deploy_non_meta } = getSettings(network);
  //deploying ERC1155 with meta support if needed
  if (!!deploy_meta) {
    await deployERC1155(ERC1155GebridMeta, ERC1155GebridBeaconMeta, transferProxy, erc1155LazyMintTransferProxy, deployer, network);
  }

  if (!!deploy_non_meta){
    await deployERC1155(ERC1155Gebrid, ERC1155GebridBeacon, transferProxy, erc1155LazyMintTransferProxy, deployer, network);
  }

  //deploying erc721 proxy
  const erc721Proxy = await deployProxy(ERC721Gebrid, ["Gebrid", "GBRD", "ipfs:/", "", transferProxy, erc721LazyMintTransferProxy], { deployer, initializer: '__ERC721Gebrid_init' });
  console.log("deployed erc721 at", erc721Proxy.address)

  //deploying erc712 factory
  //ERC721Gebrid implementation
  const erc721 = await getProxyImplementation(ERC721Gebrid, network, ProxyAdmin)

  //deploying ERC721GebridBeacon
  const beacon721 = await deployer.deploy(ERC721GebridBeacon, erc721, { gas: 1000000 });

};

async function deployERC1155(erc1155toDeploy, beaconToDeploy, transferProxy, erc1155LazyMintTransferProxy, deployer, network) {
  //deploying erc1155 proxy
  const erc1155Proxy = await deployProxy(erc1155toDeploy, ["Gebrid", "GBRD", "ipfs:/", "", transferProxy, erc1155LazyMintTransferProxy], { deployer, initializer: '__ERC1155Gebrid_init' });
  console.log("deployed erc1155 at", erc1155Proxy.address)

  //deploying erc1155 factory
  //ERC1155Gebrid implementation
  const erc1155 = await getProxyImplementation(erc1155toDeploy, network, ProxyAdmin)

  //deploying beacon
  const beacon1155 = await deployer.deploy(beaconToDeploy, erc1155, { gas: 1000000 });
}
