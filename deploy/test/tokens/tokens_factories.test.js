const ERC721GebridMinimal = artifacts.require("ERC721GebridMinimal.sol");
const ERC721GebridFactoryC2 = artifacts.require("ERC721GebridFactoryC2.sol");

const ERC1155GebridFactoryC2 = artifacts.require("ERC1155GebridFactoryC2.sol");
const ERC1155Gebrid = artifacts.require("ERC1155Gebrid.sol");

const truffleAssert = require('truffle-assertions');

const zeroWord = "0x0000000000000000000000000000000000000000000000000000000000000000";

contract("Test factories and tokens", accounts => {

	const minter = accounts[1];
  const salt = 3;
  const transferTo = accounts[2];
  const tokenId = minter + "b00000000000000000000001";
  const tokenURI = "//uri";

  const supply = 5;
  const mint = 2;

  it("gebrid erc721 collection should be able to mint tokens", async () => {
    const token = await ERC721GebridMinimal.deployed();

    await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});
    assert.equal(await token.ownerOf(tokenId), transferTo, "owner1");
    assert.equal(await token.name(), "Gebrid", "name")

    await token.safeTransferFrom(transferTo, minter, tokenId, { from: transferTo });
    assert.equal(await token.ownerOf(tokenId), minter, "owner2");
  })

  it("gebrid erc1155 collection should be able to mint tokens", async () => {
    const token = await ERC1155Gebrid.deployed();

    await token.mintAndTransfer([tokenId, tokenURI, supply, creators([minter]), [], [zeroWord]], transferTo, mint, {from: minter});
    assert.equal(await token.balanceOf(transferTo, tokenId), mint);
    assert.equal(await token.name(), "Gebrid", "name")

    await token.safeTransferFrom(transferTo, minter, tokenId, mint, [], { from: transferTo });

    assert.equal(await token.balanceOf(minter, tokenId), mint);
  })

	it("create public collection from 721 factory, it should be able to mint tokens", async () => {
    const factory = await ERC721GebridFactoryC2.deployed();

    let proxy;
    const addressBeforeDeploy = await factory.getAddress("name", "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", salt)

		const resultCreateToken = await factory.methods['createToken(string,string,string,string,uint256)']("name", "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", salt, {from: minter});
      truffleAssert.eventEmitted(resultCreateToken, 'Create721GebridProxy', (ev) => {
        proxy = ev.proxy;
        return true;
      });
		const token = await ERC721GebridMinimal.at(proxy);

    assert.equal(proxy, addressBeforeDeploy, "correct address got before deploy")

    await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});
    assert.equal(await token.ownerOf(tokenId), transferTo);
    assert.equal(await token.name(), "name")

    await token.safeTransferFrom(transferTo, minter, tokenId, { from: transferTo });
    assert.equal(await token.ownerOf(tokenId), minter);
	})

  it("create private collection from 721 factory, it should be able to mint tokens", async () => {
    const factory = await ERC721GebridFactoryC2.deployed();

    let proxy;
    const addressBeforeDeploy = await factory.getAddress("name", "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", [], salt)

		const resultCreateToken = await factory.createToken("name", "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", [], salt, {from: minter});
      truffleAssert.eventEmitted(resultCreateToken, 'Create721GebridUserProxy', (ev) => {
        proxy = ev.proxy;
        return true;
      });
		const token = await ERC721GebridMinimal.at(proxy);

    assert.equal(proxy, addressBeforeDeploy, "correct address got before deploy")

    await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});
    assert.equal(await token.ownerOf(tokenId), transferTo);
    assert.equal(await token.name(), "name")

    await token.safeTransferFrom(transferTo, minter, tokenId, { from: transferTo });
    assert.equal(await token.ownerOf(tokenId), minter);
	})

  it("create public collection from 1155 factory, it should be able to mint tokens", async () => {
    const factory = await ERC1155GebridFactoryC2.deployed();

    let proxy;
    const addressBeforeDeploy = await factory.getAddress("name", "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", salt)

		const resultCreateToken = await factory.methods['createToken(string,string,string,string,uint256)']("name", "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", salt, {from: minter});
      truffleAssert.eventEmitted(resultCreateToken, 'Create1155GebridProxy', (ev) => {
        proxy = ev.proxy;
        return true;
      });
		const token = await ERC1155Gebrid.at(proxy);

    assert.equal(proxy, addressBeforeDeploy, "correct address got before deploy")

    await token.mintAndTransfer([tokenId, tokenURI, supply, creators([minter]), [], [zeroWord]], transferTo, mint, {from: minter});
    assert.equal(await token.balanceOf(transferTo, tokenId), mint);
    assert.equal(await token.name(), "name", "name")

    await token.safeTransferFrom(transferTo, minter, tokenId, mint, [], { from: transferTo });
    assert.equal(await token.balanceOf(minter, tokenId), mint);

  })

  it("create private collection from 1155 factory, it should be able to mint tokens", async () => {
    const factory = await ERC1155GebridFactoryC2.deployed();

    let proxy;
    const addressBeforeDeploy = await factory.getAddress("name", "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", [], salt)

		const resultCreateToken = await factory.createToken("name", "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", [], salt, {from: minter});
      truffleAssert.eventEmitted(resultCreateToken, 'Create1155GebridUserProxy', (ev) => {
        proxy = ev.proxy;
        return true;
      });
		const token = await ERC1155Gebrid.at(proxy);

    assert.equal(proxy, addressBeforeDeploy, "correct address got before deploy")

    await token.mintAndTransfer([tokenId, tokenURI, supply, creators([minter]), [], [zeroWord]], transferTo, mint, {from: minter});
    assert.equal(await token.balanceOf(transferTo, tokenId), mint);
    assert.equal(await token.name(), "name", "name")

    await token.safeTransferFrom(transferTo, minter, tokenId, mint, [], { from: transferTo });
    assert.equal(await token.balanceOf(minter, tokenId), mint);
  })

  function creators(list) {
  	const value = 10000 / list.length
  	return list.map(account => ({ account, value }))
  }

});
