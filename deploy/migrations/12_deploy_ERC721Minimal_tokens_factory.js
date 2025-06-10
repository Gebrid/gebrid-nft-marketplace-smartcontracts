const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const contract = require("@truffle/contract");
const adminJson = require("@openzeppelin/upgrades-core/artifacts/ProxyAdmin.json")
const ProxyAdmin = contract(adminJson)
ProxyAdmin.setProvider(web3.currentProvider)

const { getProxyImplementation, getSettings, updateImplementation } = require("./config.js")

const ERC721GebridMinimal = artifacts.require('ERC721GebridMinimal');

const ERC721GebridFactoryC2 = artifacts.require('ERC721GebridFactoryC2');

const ERC721GebridMinimalBeacon = artifacts.require('ERC721GebridMinimalBeacon');
const ERC721GebridMinimalBeaconMeta = artifacts.require('ERC721GebridMinimalBeaconMeta');

const TransferProxy = artifacts.require('TransferProxy');
const ERC721LazyMintTransferProxy = artifacts.require('ERC721LazyMintTransferProxy');

const ERC721GebridMeta = artifacts.require('ERC721GebridMeta');

module.exports = async function (deployer, network) {

  const { deploy_meta, deploy_non_meta } = getSettings(network);

  if (!!deploy_meta) {
    await deployERC721Minimal(ERC721GebridMeta, ERC721GebridMinimalBeaconMeta, deployer, network);
  }

  if (!!deploy_non_meta){
    await deployERC721Minimal(ERC721GebridMinimal, ERC721GebridMinimalBeacon, deployer, network);
  }

};

async function deployERC721Minimal(erc721toDeploy, beacon, deployer, network) {
  const transferProxy = (await TransferProxy.deployed()).address;
  const erc721LazyMintTransferProxy = (await ERC721LazyMintTransferProxy.deployed()).address;

  //deploying erc721 minimal
  const erc721Proxy = await deployProxy(erc721toDeploy, ["Gebrid", "GBRD", "ipfs:/", "", transferProxy, erc721LazyMintTransferProxy], { deployer, initializer: '__ERC721Gebrid_init' });
  console.log("deployed erc721 minimal at", erc721Proxy.address)

  const erc721minimal = await getProxyImplementation(erc721toDeploy, network, ProxyAdmin)

  //upgrading 721 beacon
  await deployer.deploy(beacon, erc721minimal, { gas: 1000000 });
  const beacon721Minimal = await beacon.deployed()

  //deploying factory
  const factory721 = await deployer.deploy(ERC721GebridFactoryC2, beacon721Minimal.address, transferProxy, erc721LazyMintTransferProxy, { gas: 2500000 });
  console.log(`deployed factory721 minimal at ${factory721.address}`)
}
