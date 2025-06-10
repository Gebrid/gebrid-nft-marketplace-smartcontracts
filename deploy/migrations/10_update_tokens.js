const contract = require("@truffle/contract");
const adminJson = require("@openzeppelin/upgrades-core/artifacts/ProxyAdmin.json")
const ProxyAdmin = contract(adminJson)
ProxyAdmin.setProvider(web3.currentProvider)

const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { getProxyImplementation, getSettings, updateImplementation } = require("./config.js")

const ERC721Gebrid = artifacts.require('ERC721Gebrid');
const ERC721GebridBeacon = artifacts.require('ERC721GebridBeacon');
const ERC1155Gebrid = artifacts.require('ERC1155Gebrid');
const ERC1155GebridBeacon = artifacts.require('ERC1155GebridBeacon');
const ERC1155GebridBeaconMeta = artifacts.require('ERC1155GebridBeaconMeta');

const ERC1155GebridMeta = artifacts.require('ERC1155GebridMeta');

module.exports = async function (deployer, network) {
  const { deploy_meta, deploy_non_meta } = getSettings(network);

  if (!!deploy_meta) {
    await upgradeERC1155(ERC1155GebridMeta, ERC1155GebridBeaconMeta, deployer, network);
  }

  if (!!deploy_non_meta){
    await upgradeERC1155(ERC1155Gebrid, ERC1155GebridBeacon, deployer, network);
  }

  //upgrading erc721 token
  const erc721Proxy = await ERC721Gebrid.deployed();
  await upgradeProxy(erc721Proxy.address, ERC721Gebrid, { deployer });

  //upgrading erc721 factory
  const erc721 = await getProxyImplementation(ERC721Gebrid, network, ProxyAdmin)
  const beacon721 = await ERC721GebridBeacon.deployed();
  await updateImplementation(beacon721, erc721)

};

async function upgradeERC1155(erc1155toDeploy, beacon, deployer, network) {
  //upgrading erc1155 token
  const erc1155Proxy = await erc1155toDeploy.deployed();
  await upgradeProxy(erc1155Proxy.address, erc1155toDeploy, { deployer });

  //upgrading erc1155 factory
  const erc1155 = await getProxyImplementation(erc1155toDeploy, network, ProxyAdmin)
  const beacon1155 = await beacon.deployed();

  await updateImplementation(beacon1155, erc1155);
}
