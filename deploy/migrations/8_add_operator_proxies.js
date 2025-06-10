const TransferProxy = artifacts.require('TransferProxy');
const ERC721LazyMintTransferProxy = artifacts.require('ERC721LazyMintTransferProxy');
const ERC1155LazyMintTransferProxy = artifacts.require('ERC1155LazyMintTransferProxy');
const ERC20TransferProxy = artifacts.require('ERC20TransferProxy');
const Exchange = artifacts.require('Exchange');

const ExchangeMeta = artifacts.require('ExchangeMeta');

const { ERC721_LAZY, ERC1155_LAZY, getSettings } = require("./config.js")

module.exports = async function (deployer, network) {

  const { deploy_meta, deploy_non_meta } = getSettings(network);

  if (!!deploy_meta) {
    await setTransferProxies(await ExchangeMeta.deployed());
  }

  if (!!deploy_non_meta){
    await setTransferProxies(await Exchange.deployed());
  }

};

async function setTransferProxies(exchange) {
  //add exchange as operator to proxies
  const transferProxy = await TransferProxy.deployed();
  await transferProxy.addOperator(exchange.address)

  const erc721LazyMintTransferProxy = await ERC721LazyMintTransferProxy.deployed();
  await erc721LazyMintTransferProxy.addOperator(exchange.address)
  await exchange.setTransferProxy(ERC721_LAZY, erc721LazyMintTransferProxy.address)

  const erc1155LazyMintTransferProxy = await ERC1155LazyMintTransferProxy.deployed();
  await erc1155LazyMintTransferProxy.addOperator(exchange.address)
  await exchange.setTransferProxy(ERC1155_LAZY, erc1155LazyMintTransferProxy.address)

  const erc20TransferProxy = await ERC20TransferProxy.deployed();
  await erc20TransferProxy.addOperator(exchange.address)
}

