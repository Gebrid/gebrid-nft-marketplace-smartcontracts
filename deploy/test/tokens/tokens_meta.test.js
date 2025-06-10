const ERC721GebridMeta = artifacts.require("ERC721GebridMeta.sol");

const ERC1155GebridMeta = artifacts.require("ERC1155GebridMeta.sol");

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
    const token = await ERC721GebridMeta.deployed();

    await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});
    assert.equal(await token.ownerOf(tokenId), transferTo, "owner1");
    assert.equal(await token.name(), "Gebrid", "name")

    await token.safeTransferFrom(transferTo, minter, tokenId, { from: transferTo });
    assert.equal(await token.ownerOf(tokenId), minter, "owner2");
  })

  it("gebrid erc1155 collection should be able to mint tokens", async () => {
    const token = await ERC1155GebridMeta.deployed();

    await token.mintAndTransfer([tokenId, tokenURI, supply, creators([minter]), [], [zeroWord]], transferTo, mint, {from: minter});
    assert.equal(await token.balanceOf(transferTo, tokenId), mint);
    assert.equal(await token.name(), "Gebrid", "name")

    await token.safeTransferFrom(transferTo, minter, tokenId, mint, [], { from: transferTo });

    assert.equal(await token.balanceOf(minter, tokenId), mint);
  })

  function creators(list) {
  	const value = 10000 / list.length
  	return list.map(account => ({ account, value }))
  }

});
