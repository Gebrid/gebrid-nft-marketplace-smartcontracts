#!/usr/bin/env bash
truffle test ./test/exchange/Exchange.test.js \
            ./test/exchange/ExchangeMeta.test.js \
            ./test/exchange/contracts/GebridTestHelper.sol \
            ./test/contracts/TestERC721RoyaltiesV1.sol \
            ./test/contracts/TestERC721RoyaltiesV2.sol \
            ./test/contracts/TestERC1155RoyaltiesV2.sol \
            ./test/contracts/TestERC20.sol \
            ./test/contracts/ERC721LazyMintTest.sol \
            --compile-all
