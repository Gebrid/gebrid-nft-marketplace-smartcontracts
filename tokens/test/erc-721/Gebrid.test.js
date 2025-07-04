const Testing = artifacts.require("ERC721Gebrid.sol");
const ERC1271 = artifacts.require("TestERC1271.sol");
const UpgradeableBeacon = artifacts.require("UpgradeableBeacon.sol");
const ERC721Factory = artifacts.require("ERC721GebridFactoryC2.sol");
const ERC721LazyMintTransferProxy = artifacts.require("ERC721LazyMintTransferProxyTest.sol");
const TransferProxyTest = artifacts.require("TransferProxyTest.sol");
const TestRoyaltyV2981Calculate = artifacts.require("TestRoyaltyV2981Calculate.sol");
const truffleAssert = require('truffle-assertions');

const { sign } = require("./mint");
const { expectThrow } = require("@daonomic/tests-common");

contract("ERC721Gebrid", accounts => {

  let token;
  let tokenOwner = accounts[9];
  let erc1271;
  let beacon;
  let proxy;
  let proxyLazy;
  let whiteListProxy = accounts[5];
  const name = 'FreeMintableGebrid';
  const chainId = 1;
  const zeroWord = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const ZERO = "0x0000000000000000000000000000000000000000";

  function creators(list) {
  	const value = 10000 / list.length
  	return list.map(account => ({ account, value }))
  }

  function fees(list) {
    const value = 500;
    return list.map(account => ({ account, value }))
  }

  function feesWithZero(list) {
    const value = 0;
    return list.map(account => ({ account, value }))
  }

  before(async () => {
    proxyLazy = await ERC721LazyMintTransferProxy.new();
    transferProxy = await TransferProxyTest.new();
    erc1271 = await ERC1271.new();
  })

  beforeEach(async () => {
    token = await Testing.new();
    await token.__ERC721Gebrid_init(name, "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", whiteListProxy, proxyLazy.address);
    await token.transferOwnership(tokenOwner);
  });

  describe("Burn before ERC721Gebrid ()", () => {
    it("Run burn from minter, mintAndTransfer by the same minter not possible, token burned, throw", async () => {
      const minter = accounts[1];
      let transferTo = accounts[4];

      const tokenId = minter + "b00000000000000000000001";
      const tokenURI = "//uri";
      //minter burn item, in tokenId minter address contains, ok
      await token.burn(tokenId, {from: minter});
      await expectThrow( //try to mint and transfer token, throw, because token was burned
        token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter})
      );
    });

    it("Run burn from another, throw, mintAndTransfer by the same minter is possible", async () => {
      const minter = accounts[1];
      let transferTo = accounts[2];

      const tokenId = minter + "b00000000000000000000001";
      const tokenURI = "//uri";
      await expectThrow( //another burn item, in tokenId minter address contains, throw
        token.burn(tokenId, {from: transferTo})
      );
      //mint and transfer token, ok, because token was not burned, possible to mint to a new user
      await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});
      assert.equal(await token.ownerOf(tokenId), transferTo);
    });
  });

  describe("Burn after ERC721Gebrid ()", () => {
    it("Run mintAndTransfer, burn, mintAndTransfer by the same minter, throw", async () => {
      const minter = accounts[1];
      let transferTo = accounts[2];
      let transferTo2 = accounts[4];

      const tokenId = minter + "b00000000000000000000001";
      const tokenURI = "//uri";

      await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});
      await token.burn(tokenId, {from: transferTo});
      await expectThrow( //try once more mint and transfer
        token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo2, {from: minter})
      );
    });

    it("Run transferFromOrMint, burn, transferFromOrMint by the same minter, throw", async () => {
      const minter = accounts[1];
      let transferTo = accounts[2];

      const tokenId = minter + "b00000000000000000000001";
      const tokenURI = "//uri";

      await token.transferFromOrMint([tokenId, tokenURI, creators([minter]), [], [zeroWord]], minter, transferTo, {from: minter});
      assert.equal(await token.ownerOf(tokenId), transferTo);
      await token.burn(tokenId, {from: transferTo});
      await expectThrow(
        token.transferFromOrMint([tokenId, tokenURI, creators([minter]), [], [zeroWord]], minter, transferTo, {from: minter})
      )
    });

  });

  it("mint and transfer by minter, and token created by ERC721Factory ", async () => {
    beacon = await UpgradeableBeacon.new(token.address);
    factory = await ERC721Factory.new(beacon.address, transferProxy.address, proxyLazy.address);
    const resultCreateToken = await factory.methods['createToken(string,string,string,string,uint256)']("name", "GBRD", "https://ipfs.gebrid.com", "https://ipfs.gebrid.com", 1, {from: tokenOwner});
    truffleAssert.eventEmitted(resultCreateToken, 'Create721GebridProxy', (ev) => {
       proxy = ev.proxy;
      return true;
    });
    tokenByProxy = await Testing.at(proxy);

    const minter = tokenOwner;
    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";

    const tx = await tokenByProxy.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], minter, {from: minter});
    const Transfer = await tokenByProxy.getPastEvents("Transfer", {
      fromBlock: tx.receipt.blockNumber,
      toBlock: tx.receipt.blockNumber
    });
    assert.equal(Transfer.length, 1, "Transfer.length")

    assert.equal(await tokenByProxy.ownerOf(tokenId), minter);
  });

  it("checkPrefix should work correctly, checks for duplicating of the base part of the uri ", async () => {
    beacon = await UpgradeableBeacon.new(token.address);
    factory = await ERC721Factory.new(beacon.address, transferProxy.address, proxyLazy.address);
    const baseURI = "https://ipfs.gebrid.com"
    const resultCreateToken = await factory.methods['createToken(string,string,string,string,uint256)']("name", "GBRD", baseURI, "https://ipfs.gebrid.com", 1, {from: tokenOwner});
    truffleAssert.eventEmitted(resultCreateToken, 'Create721GebridProxy', (ev) => {
       proxy = ev.proxy;
      return true;
    });
    tokenByProxy = await Testing.at(proxy);

    const minter = tokenOwner;
    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = baseURI + "/12345/456";

    await tokenByProxy.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], minter, {from: minter});
    const gettokeURI = await tokenByProxy.tokenURI(tokenId);
    assert.equal(gettokeURI, tokenURI, "token uri same with base")

    const tokenId1 = minter + "b00000000000000000000002"
    const tokenURI1 = "/12345/123512512/12312312";
    await tokenByProxy.mintAndTransfer([tokenId1, tokenURI1, creators([minter]), [], [zeroWord]], minter, {from: minter});
    const gettokeURI1 = await tokenByProxy.tokenURI(tokenId1);
    assert.equal(gettokeURI1, baseURI + tokenURI1, "different uri")

    const tokenId2 = minter + "b00000000000000000000003"
    const tokenURI2 = "/12345/";
    await tokenByProxy.mintAndTransfer([tokenId2, tokenURI2, creators([minter]), [], [zeroWord]], minter, {from: minter});
    const gettokeURI2 = await tokenByProxy.tokenURI(tokenId2);
    assert.equal(gettokeURI2, baseURI + tokenURI2, "different uri")
  });

  it("check for ERC165 interface", async () => {
  	assert.equal(await token.supportsInterface("0x01ffc9a7"), true);
  });

  it("check for mintAndTransfer interface", async () => {
  	assert.equal(await token.supportsInterface("0x8486f69f"), true);
  });

  it("check for RoayltiesV2 interface", async () => {
  	assert.equal(await token.supportsInterface("0xcad96cca"), true);
  });

  it("check for support IERC2981 interface", async () => {
  	assert.equal(await token.supportsInterface("0x2a55205a"), true);
  });

  it("check for ERC721 interfaces", async () => {
  	assert.equal(await token.supportsInterface("0x80ac58cd"), true);
  	assert.equal(await token.supportsInterface("0x5b5e139f"), true);
  	assert.equal(await token.supportsInterface("0x780e9d63"), true);
  });

  it("approve for all", async () => {
    assert.equal(await token.isApprovedForAll(accounts[1], whiteListProxy), true);
    assert.equal(await token.isApprovedForAll(accounts[1], proxyLazy.address), true);
  });

  it("set new BaseUri, check only owner, check emit event", async () => {
    let olBaseUri = await token.baseURI();
    const newBusaUriSet = "https://ipfs.gebrid-the-best-in-the-World.com"
    await expectThrow(
      token.setBaseURI(newBusaUriSet)//caller is not the owner
    );
    let tx = await token.setBaseURI(newBusaUriSet, { from: tokenOwner })//caller is owner
    let newBaseUri = await token.baseURI();
    assert.equal(newBaseUri, newBusaUriSet);
    assert.notEqual(newBaseUri, olBaseUri);

    let newBaseUriFromEvent;
    truffleAssert.eventEmitted(tx, 'BaseUriChanged', (ev) => {
     	newBaseUriFromEvent = ev.newBaseURI;
      return true;
    });
    assert.equal(newBaseUri, newBaseUriFromEvent);
  });

  it("check Royalties IERC2981, with 3 royaltiesBeneficiary ", async () => {
    let testRoyaltyV2981Calculate = await TestRoyaltyV2981Calculate.new();

    const minter = accounts[1];
    let transferTo = accounts[2];
    let royaltiesBeneficiary1 = accounts[3];
    let royaltiesBeneficiary2 = accounts[4];
    let royaltiesBeneficiary3 = accounts[6];
    const WEIGHT_PRICE = 1000000;
    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    const signature = await getSignature(tokenId, tokenURI, creators([minter]), fees([royaltiesBeneficiary1,royaltiesBeneficiary2,royaltiesBeneficiary3]), minter);

    const tx = await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), fees([royaltiesBeneficiary1,royaltiesBeneficiary2,royaltiesBeneficiary3]), [signature]], transferTo, {from: whiteListProxy});
    const addressValue = await token.royaltyInfo(tokenId, WEIGHT_PRICE);

    assert.equal(addressValue[0], royaltiesBeneficiary1, "account");
    assert.equal(addressValue[1], 150000, "value"); //why 150000?: 3 beneficiaries, each have 5%(500) in total 15%(1500), but WEIGHT_PRICE = 1000000, and 15% form this is 150000
    const royaltiesAddress = addressValue[0];
    const royaltiesPercent = addressValue[1];
    let royaltiesPart = await testRoyaltyV2981Calculate.calculateRoyaltiesTest(royaltiesAddress, royaltiesPercent);
    assert.equal(royaltiesPart[0].account, royaltiesBeneficiary1, "account");
    assert.equal(royaltiesPart[0].value, 1500, "value");
  });

  it("check Royalties IERC2981, with 3 royaltiesBeneficiary zero fee, throw ", async () => {
    let testRoyaltyV2981Calculate = await TestRoyaltyV2981Calculate.new();

    const minter = accounts[1];
    let transferTo = accounts[2];
    let royaltiesBeneficiary1 = accounts[3];
    let royaltiesBeneficiary2 = accounts[4];
    let royaltiesBeneficiary3 = accounts[6];
    const WEIGHT_PRICE = 1000000;
    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    const signature = await getSignature(tokenId, tokenURI, creators([minter]), feesWithZero([royaltiesBeneficiary1,royaltiesBeneficiary2,royaltiesBeneficiary3]), minter);

    await expectThrow(
      token.mintAndTransfer([tokenId, tokenURI, creators([minter]), feesWithZero([royaltiesBeneficiary1,royaltiesBeneficiary2,royaltiesBeneficiary3]), [signature]], transferTo, {from: whiteListProxy})
    );
  });

  it("check Royalties IERC2981, with only 1 royaltiesBeneficiary ", async () => {
    let testRoyaltyV2981Calculate = await TestRoyaltyV2981Calculate.new();

    const minter = accounts[1];
    let transferTo = accounts[2];
    let royaltiesBeneficiary1 = accounts[3];
    const WEIGHT_PRICE = 1000000;
    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    const signature = await getSignature(tokenId, tokenURI, creators([minter]), fees([royaltiesBeneficiary1]), minter);

    const tx = await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), fees([royaltiesBeneficiary1]), [signature]], transferTo, {from: whiteListProxy});
    const addressValue = await token.royaltyInfo(tokenId, WEIGHT_PRICE);

    assert.equal(addressValue[0], royaltiesBeneficiary1, "account");
    assert.equal(addressValue[1], 50000, "value");
    const royaltiesAddress = addressValue[0];
    const royaltiesPercent = addressValue[1];
    let royaltiesPart = await testRoyaltyV2981Calculate.calculateRoyaltiesTest(royaltiesAddress, royaltiesPercent);
    assert.equal(royaltiesPart[0].account, royaltiesBeneficiary1, "account");
    assert.equal(royaltiesPart[0].value, 500, "value");
  });

  it("check Royalties IERC2981, with only 0 royaltiesBeneficiary ", async () => {
    let testRoyaltyV2981Calculate = await TestRoyaltyV2981Calculate.new();

    const minter = accounts[1];
    let transferTo = accounts[2];
    let royaltiesBeneficiary1 = accounts[3];
    const WEIGHT_PRICE = 1000000;
    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    const signature = await getSignature(tokenId, tokenURI, creators([minter]), fees([]), minter);

    const tx = await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), fees([]), [signature]], transferTo, {from: whiteListProxy});
    const addressValue = await token.royaltyInfo(tokenId, WEIGHT_PRICE);

    assert.equal(addressValue[0], 0, "account");
    assert.equal(addressValue[1], 0, "value");
    const royaltiesAddress = addressValue[0];
    const royaltiesPercent = addressValue[1];
    let royaltiesPart = await testRoyaltyV2981Calculate.calculateRoyaltiesTest(royaltiesAddress, royaltiesPercent);
    assert.equal(royaltiesPart.length, 0, "account");
  });

  it("mint and transfer by whitelist proxy", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    let fees = [];

    const signature = await getSignature(tokenId, tokenURI, creators([minter]), fees, minter);

    const tx = await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), fees, [signature]], transferTo, {from: whiteListProxy});
    const Transfer = await token.getPastEvents("Transfer", {
      fromBlock: tx.receipt.blockNumber,
      toBlock: tx.receipt.blockNumber
    });
    assert.equal(Transfer.length, 2, "Transfer.length")
    const transferEvent0 = Transfer[0]
    const transferEvent1 = Transfer[1]

    assert.equal(transferEvent0.args.from, "0x0000000000000000000000000000000000000000", "transfer 0 from")
    assert.equal(transferEvent0.args.to, minter, "transfer 0 to")
    assert.equal("0x" + transferEvent0.args.tokenId.toString(16), tokenId.toLowerCase(), "transfer 0 tokenId")

    assert.equal(transferEvent1.args.from, minter, "transfer 1 from")
    assert.equal(transferEvent1.args.to, transferTo, "transfer 1 to")
    assert.equal("0x" + transferEvent1.args.tokenId.toString(16), tokenId.toLowerCase(), "transfer 1 tokenId")

    assert.equal(await token.ownerOf(tokenId), transferTo);
    await checkCreators(tokenId, [minter]);
    // assert.equal(await token.getCreators(tokenId), [minter]);
  });

  it("mint and transfer by whitelist proxy. several creators", async () => {
    const minter = accounts[1];
    const creator2 = accounts[3];
    let transferTo = accounts[2];

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    let fees = [];

    const signature1 = await getSignature(tokenId, tokenURI, creators([minter, creator2]), fees, minter);
    const signature2 = await getSignature(tokenId, tokenURI, creators([minter, creator2]), fees, creator2);

    await token.mintAndTransfer([tokenId, tokenURI, creators([minter, creator2]), fees, [signature1, signature2]], transferTo, {from: whiteListProxy});

    assert.equal(await token.ownerOf(tokenId), transferTo);
    await checkCreators(tokenId, [minter, creator2]);
  });

  it("mint and transfer by whitelist proxy. several creators. minter is not first", async () => {
    const minter = accounts[1];
    const creator2 = accounts[3];
    let transferTo = accounts[2];

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    let fees = [];

    const signature1 = await getSignature(tokenId, tokenURI, creators([creator2, minter]), fees, minter);
    const signature2 = await getSignature(tokenId, tokenURI, creators([creator2, minter]), fees, creator2);

    await expectThrow(
      token.mintAndTransfer([tokenId, tokenURI, creators([creator2, minter]), fees, [signature2, signature1]], transferTo, {from: whiteListProxy})
    );
  });

  it("mint and transfer by whitelist proxy. several creators. wrong order of signatures", async () => {
    const minter = accounts[1];
    const creator2 = accounts[3];
    let transferTo = accounts[2];

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    let fees = [];

    const signature1 = await getSignature(tokenId, tokenURI, creators([minter, creator2]), fees, minter);
    const signature2 = await getSignature(tokenId, tokenURI, creators([minter, creator2]), fees, creator2);

    await expectThrow(
      token.mintAndTransfer([tokenId, tokenURI, creators([minter, creator2]), fees, [signature2, signature1]], transferTo, {from: whiteListProxy})
    );
  });

  it("mint and transfer by approved proxy for all", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";

    const signature = await getSignature(tokenId, tokenURI, creators([minter]), [], minter);

    let proxy = accounts[5];
    await token.setApprovalForAll(proxy, true, {from: minter});
    const ttxx = await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [signature]], transferTo, {from: proxy});
    console.log(ttxx.receipt.gasUsed)

    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("mint and transfer by approved proxy for tokenId", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";

    const signature = await getSignature(tokenId, tokenURI, creators([minter]), [], minter);

    let proxy = accounts[5];

    //нельзя дать approval для tokenId, который еще не создали. owner query for nonexistent token.
    await expectThrow(
      token.approve(proxy, tokenId, {from: minter})
    );
    //todo ничего не проверяет?
    // await token.mintAndTransfer(tokenId, [], tokenURI, [minter], [signature], transferTo, {from: proxy});
    // assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("mint and transfer by minter", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";

    await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});

    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("transferFromOrMint from minter. not yet minted", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";

    await token.transferFromOrMint([tokenId, tokenURI, creators([minter]), [], [zeroWord]], minter, transferTo, {from: minter});

    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("transferFromOrMint from minter. already minted", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";

		await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], minter, {from: minter});
    await token.transferFromOrMint([tokenId, tokenURI, creators([minter]), [], [zeroWord]], minter, transferTo, {from: minter});
    await expectThrow(
    	token.transferFromOrMint([tokenId, tokenURI, creators([minter]), [], [zeroWord]], minter, transferTo, {from: minter})
    )

    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("transferFromOrMint when not minter. not yet minted", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";

		await expectThrow(
			token.transferFromOrMint([tokenId, tokenURI, creators([minter]), [], [zeroWord]], minter, transferTo, {from: transferTo})
		);
    await token.transferFromOrMint([tokenId, tokenURI, creators([minter]), [], [zeroWord]], minter, transferTo, {from: minter});
    await token.transferFromOrMint([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, accounts[5], {from: transferTo});

    assert.equal(await token.ownerOf(tokenId), accounts[5]);
  });

  it("mint and transfer to self by minter", async () => {
    const minter = accounts[1];
    let transferTo = minter;

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";

    await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});

    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("mint and transfer with signature of not minter", async () => {
    const minter = accounts[1];
    const transferTo = accounts[2];

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";

    const signature = await getSignature(tokenId, tokenURI, creators([minter]), [], transferTo);

    await expectThrow(
      token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [signature]], transferTo, {from: whiteListProxy})
    );
  });

  it("mint and transfer without approval", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";

    const signature = await getSignature(tokenId, tokenURI, creators([minter]), [], minter);

    await expectThrow(
      token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [signature]], transferTo, {from: accounts[3]})
    );
  });

  it("standard transfer from owner", async () => {
    let minter = accounts[1];
    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], minter, {from: minter});

    assert.equal(await token.ownerOf(tokenId), minter);

    let transferTo = accounts[2];
    await token.transferFrom(minter, transferTo, tokenId, {from: minter});

    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("standard transfer by approved contract", async () => {
    let minter = accounts[1];
    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], minter, {from: minter});

    assert.equal(await token.ownerOf(tokenId), minter);

    let transferTo = accounts[2];
    await token.transferFrom(minter, transferTo, tokenId, {from: whiteListProxy});

    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("standard transfer by not approved contract", async () => {
    let minter = accounts[1];
    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], minter, {from: minter});

    assert.equal(await token.ownerOf(tokenId), minter);

    let transferTo = accounts[2];
    await expectThrow(
      token.transferFrom(minter, transferTo, tokenId, {from: accounts[8]})
    );
  });

  it("signature by contract wallet erc1271, with whitelist proxy", async () => {
    const minter = erc1271;
    let transferTo = accounts[2];

    const tokenId = minter.address + "b00000000000000000000001";
    const tokenURI = "//uri";

    await expectThrow(
      token.mintAndTransfer([tokenId, tokenURI, creators([minter.address]), [], [zeroWord]], transferTo, {from: whiteListProxy})
    );

    await erc1271.setReturnSuccessfulValidSignature(true);
    await token.mintAndTransfer([tokenId, tokenURI, creators([minter.address]), [], [zeroWord]], transferTo, {from: whiteListProxy});
    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  function getSignature(tokenId, tokenURI, creators, fees, account) {
		return sign(account, tokenId, tokenURI, creators, fees, token.address);
  }

  async function checkCreators(tokenId, exp) {
    const creators = await token.getCreators(tokenId);
    assert.equal(creators.length, exp.length);
    const value = 10000 / exp.length;
    for(let i = 0; i < creators.length; i++) {
      assert.equal(creators[i][0], exp[i]);
      assert.equal(creators[i][1], value);
    }
  }
});
