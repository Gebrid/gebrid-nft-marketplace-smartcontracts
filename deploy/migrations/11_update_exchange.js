const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const { getSettings } = require("./config.js")

const Exchange = artifacts.require('Exchange');
const ExchangeMeta = artifacts.require('ExchangeMeta');

module.exports = async function (deployer, network) {
  const { deploy_meta, deploy_non_meta } = getSettings(network);

  //deploying Exchange with meta support if needed
  if (!!deploy_meta) {
    await updateExchange(ExchangeMeta, deployer);
  }

  if (!!deploy_non_meta){
    await updateExchange(Exchange, deployer);
  }

};

async function updateExchange(exchangeToDeploy, deployer) {
  const existing = await exchangeToDeploy.deployed();
  await upgradeProxy(existing.address, exchangeToDeploy, { deployer });
}
