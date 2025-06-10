#!/usr/bin/env bash
truffle test \
        ./test/Exchange.simple.test.js \
        ./test/contracts/ExchangeSimple.sol \
        ./test/contracts/ExchangeSimple_1.sol \
        ./test/contracts/TestERC20.sol \
        ./test/contracts/TransferProxyTest.sol \
        ./test/contracts/ERC20TransferProxyTest.sol \
        ./test/contracts/LibOrderTest.sol \
        --compile-all
