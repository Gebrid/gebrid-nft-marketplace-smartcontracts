const UpgradeableBeacon = artifacts.require("UpgradeableBeacon.sol");
const ERC721GebridMinimal = artifacts.require("ERC721GebridMinimal.sol");
const ERC721GebridFactoryC2 = artifacts.require("ERC721GebridFactoryC2.sol");

const truffleAssert = require('truffle-assertions');

const zeroWord = "0x0000000000000000000000000000000000000000000000000000000000000000";
const zeroAddress = "0x0000000000000000000000000000000000000000";

contract("Test factories minimal", accounts => {

	const tokenOwner = accounts[1];
  const salt = 3;

  let factory;
  before(async () => {
		const impl = await ERC721GebridMinimal.new();
		const beacon = await UpgradeableBeacon.new(impl.address);
		factory = await ERC721GebridFactoryC2.new(beacon.address, zeroAddress, zeroAddress);
	})

	it("should create erc721 private from factory, getAddress works correctly", async () => {
    let proxy;
    const addressBeforeDeploy = await factory.getAddress("name", "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", [], salt)

		const resultCreateToken = await factory.createToken("name", "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", [], salt, {from: tokenOwner});
      truffleAssert.eventEmitted(resultCreateToken, 'Create721GebridUserProxy', (ev) => {
        proxy = ev.proxy;
        return true;
      });
		const token = await ERC721GebridMinimal.at(proxy);
    const minter = tokenOwner;
    let transferTo = accounts[2];

    assert.equal(proxy, addressBeforeDeploy, "correct address got before deploy")

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    console.log("Before call _mintAndTransfer");
    const tx = await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});

		console.log("mint through proxy", tx.receipt.gasUsed);
    assert.equal(await token.ownerOf(tokenId), transferTo);
    assert.equal(await token.name(), "name")

    const txTransfer = await token.safeTransferFrom(transferTo, minter, tokenId, { from: transferTo });
    console.log("transfer through proxy", txTransfer.receipt.gasUsed);
	})

	it("test check don`t add operators while create token create erc721 private from factory, getAddress works correctly", async () => {
    let proxy;
    const operator1 = accounts[7];
		const resultCreateToken = await factory.createToken("name", "GBRD2", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", [operator1], salt, {from: tokenOwner, gasPrice: 0});
      truffleAssert.eventEmitted(resultCreateToken, 'Create721GebridUserProxy', (ev) => {
        proxy = ev.proxy;
        return true;
      });
		const token = await ERC721GebridMinimal.at(proxy);
		assert.equal(await token.isApprovedForAll(factory.address, operator1), false);
		assert.equal(await token.isApprovedForAll(tokenOwner, operator1), false);

		await token.setApprovalForAll(operator1, true, {from: tokenOwner});
		//only after tokenOwner call isApprovedForAll to operator1, operator1 is approved
		assert.equal(await token.isApprovedForAll(tokenOwner, operator1), true);
	})

  it("should create erc721 public from factory, getAddress works correctly", async () => {
    let proxy;
    const addressBeforeDeploy = await factory.getAddress("name", "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", salt)

		const resultCreateToken = await factory.methods['createToken(string,string,string,string,uint256)']("name", "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", salt, {from: tokenOwner});
      truffleAssert.eventEmitted(resultCreateToken, 'Create721GebridProxy', (ev) => {
        proxy = ev.proxy;
        return true;
      });
		const token = await ERC721GebridMinimal.at(proxy);
    const minter = tokenOwner;
    let transferTo = accounts[2];

    assert.equal(proxy, addressBeforeDeploy, "correct address got before deploy")

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    console.log("Before call _mintAndTransfer");
    const tx = await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});

		console.log("mint through proxy", tx.receipt.gasUsed);
    assert.equal(await token.ownerOf(tokenId), transferTo);
    assert.equal(await token.name(), "name")

    const txTransfer = await token.safeTransferFrom(transferTo, minter, tokenId, { from: transferTo });
    console.log("transfer through proxy", txTransfer.receipt.gasUsed);
	})

  function creators(list) {
  	const value = 10000 / list.length
  	return list.map(account => ({ account, value }))
  }

});
