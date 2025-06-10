const { getSettings } = require("./config.js")

let GebridToken = artifacts.require("GebridToken.sol");

module.exports = async function (deployer, network) {
  const settings = getSettings(network);
  console.log(settings)

  if (!settings.deploy_erc20) {
    return;
  }

  if (!!settings.gebrid_token){
    await deployer.deploy(
      GebridToken,
      settings.gebrid_token.name,
      settings.gebrid_token.symbol,
      settings.gebrid_token.signer,
      settings.gebrid_token.contractURI,
      settings.gebrid_token.tokenURIPrefix,
      { gas: 5000000 }
    );
    const gebridTokenLegacy = await GebridToken.deployed();
    console.log(`deployed gebridTokenLegacy at ${gebridTokenLegacy.address}`)
  }

};
