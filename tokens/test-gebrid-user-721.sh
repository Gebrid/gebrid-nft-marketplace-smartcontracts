#!/usr/bin/env bash
truffle test ./test/erc-721-minimal/GebridUser.test.js \
              ./test/contracts/TestERC1271.sol \
              ./contracts/create-2/ERC721GebridFactoryC2.sol \
              ./test/contracts/TestRoyaltyV2981Calculate.sol
