const AssetMatcherCollection = artifacts.require('AssetMatcherCollection');
const Exchange = artifacts.require('Exchange');
const ExchangeMeta = artifacts.require('ExchangeMeta');

const { id, getSettings } = require("./config.js");

module.exports = async function (deployer, network) {
  //deploy asset matcher for collections
  await deployer.deploy(AssetMatcherCollection, { gas: 1000000 });
  const matcher = await AssetMatcherCollection.deployed();
  console.log("asset matcher for collections deployed at", matcher.address)

  // set it in Exchange
  const settings = getSettings(network);
  if (!!settings.deploy_meta) {
    const exchange = await ExchangeMeta.deployed();
    await exchange.setAssetMatcher(id("COLLECTION"), matcher.address);
  }

  if (!!settings.deploy_non_meta) {
    const exchange = await Exchange.deployed();
    await exchange.setAssetMatcher(id("COLLECTION"), matcher.address);
  }

};
