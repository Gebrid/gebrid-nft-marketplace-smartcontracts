const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const contract = require("@truffle/contract");
const adminJson = require("@openzeppelin/upgrades-core/artifacts/ProxyAdmin.json")
const ProxyAdmin = contract(adminJson)
ProxyAdmin.setProvider(web3.currentProvider)

const ERC721GebridBeacon = artifacts.require('ERC721GebridBeacon');

const { getProxyImplementation, updateImplementation } = require("./config.js")

const ERC721Gebrid = artifacts.require('ERC721Gebrid');

module.exports = async function (deployer, network) {
  //upgrade old 721 proxy
  const erc721Proxy = await ERC721Gebrid.deployed();
  await upgradeProxy(erc721Proxy.address, ERC721Gebrid, { deployer });

  const erc721 = await getProxyImplementation(ERC721Gebrid, network, ProxyAdmin)

  const beacon721 = await ERC721GebridBeacon.deployed();

  await updateImplementation(beacon721, erc721)
};
