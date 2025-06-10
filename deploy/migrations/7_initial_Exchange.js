const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const { getSettings } = require("./config.js")

const Exchange = artifacts.require('Exchange');
const RoyaltiesRegistry = artifacts.require("RoyaltiesRegistry");
const ERC20TransferProxy = artifacts.require('ERC20TransferProxy');
const TransferProxy = artifacts.require('TransferProxy');

const ExchangeMetaV2 = artifacts.require('ExchangeMetaV2');

module.exports = async function (deployer, network) {
  const { communityWallet, deploy_meta, deploy_non_meta } = getSettings(network);

  //deploying Exchange with meta support if needed
  if (!!deploy_meta) {
    await deployExchange(ExchangeMetaV2, communityWallet, deployer);
  }

  if (!!deploy_non_meta){
    await deployExchange(Exchange, communityWallet, deployer);
  }

};

async function deployExchange(exchangeV2toDeploy, communityWallet, deployer) {
  const transferProxy = (await TransferProxy.deployed()).address;
  const erc20TransferProxy = (await ERC20TransferProxy.deployed()).address;
  const royaltiesRegistry = (await RoyaltiesRegistry.deployed()).address;

  const exchangeV2 = await deployProxy(
    exchangeV2toDeploy,
    [transferProxy, erc20TransferProxy, 0, communityWallet, royaltiesRegistry],
    { deployer, initializer: '__Exchange_init' }
  );
  console.log("deployed exchange at", exchangeV2.address)
}
