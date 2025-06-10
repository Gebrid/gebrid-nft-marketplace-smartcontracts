const ethUtil = require('ethereumjs-util');

const dev = {
  communityWallet: "0xc57421Bfd23346f45297f576048E5a46E88Acdc7",
  deploy_WETH: true,
  deploy_non_meta: true,
}
const def = {
  communityWallet: "0xbC1d8dD00Da4f2e77CF3D8B2Ba9C5a9A2c027db0",
  deploy_erc20: true,
  beneficiary: "0xbC1d8dD00Da4f2e77CF3D8B2Ba9C5a9A2c027db0",
  buyerFeeSigner: "0xbC1d8dD00Da4f2e77CF3D8B2Ba9C5a9A2c027db0",
  "gebrid_token": {
    name: "Gebrid",
    symbol: "GBRD",
    signer: "0xbC1d8dD00Da4f2e77CF3D8B2Ba9C5a9A2c027db0",
    contractURI: "https://api-e2e.gebrid.com/contractMetadata/{address}",
    tokenURIPrefix: "ipfs://",
  },
  deploy_meta: true,
  deploy_non_meta: true,
  deploy_WETH: false
}
const goerli = {
  communityWallet: "0xbC1d8dD00Da4f2e77CF3D8B2Ba9C5a9A2c027db0",
  deploy_meta: false,
  deploy_non_meta: true,
}

let settings = {
  "default": def,
  "dev": dev,
  "goerli": goerli,
};

function getSettings(network) {
  if (settings[network] !== undefined) {
    return settings[network];
  } else {
    return settings["default"];
  }
}

async function getProxyImplementation(proxy, network, ProxyAdmin) {
  if (network === "dev") {
    network = "unknown-5432"
  }

  let json;
  try {
    json = require(`../.openzeppelin/${network}.json`)
  } catch (e) {
    const tconfig = require('../truffle-config.js')
    console.log(tconfig)
    const network_id = tconfig.networks[network].network_id;
    json = require(`../.openzeppelin/unknown-${network_id}.json`)
  }
  const c = await ProxyAdmin.at(json.admin.address)
  const deployed = await proxy.deployed()
  return c.getProxyImplementation(deployed.address)
}

function id(str) {
	return `0x${ethUtil.keccak256(str).toString("hex").substring(0, 8)}`;
}

async function updateImplementation(beacon, newImpl){
  const oldImpl = await beacon.implementation();
  if (oldImpl != newImpl){
    console.log(`old impl = ${oldImpl}`)
    await beacon.upgradeTo(newImpl, { gas: 200000 })
    console.log(`new impl = ${await beacon.implementation()}`)
  }
}

const ERC721_LAZY = id("ERC721_LAZY");
const ERC1155_LAZY = id("ERC1155_LAZY");

module.exports = { getSettings, getProxyImplementation, ERC721_LAZY, ERC1155_LAZY, id, updateImplementation };
