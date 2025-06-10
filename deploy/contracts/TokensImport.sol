// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

//token 20
import {GebridToken} from "@gebrid/tokens/contracts/erc-20/GebridToken.sol";
import {ERC20Pausable} from "@gebrid/tokens/contracts/erc-20/ERC20Pausable.sol";

//tokens 721
import {ERC721Gebrid} from "@gebrid/tokens/contracts/erc-721/ERC721Gebrid.sol";
import {ERC721GebridMinimal} from "@gebrid/tokens/contracts/erc-721-minimal/ERC721GebridMinimal.sol";
import {ERC721GebridFactoryC2} from "@gebrid/tokens/contracts/create-2/ERC721GebridFactoryC2.sol";

//tokens 1155
import {ERC1155Gebrid} from "@gebrid/tokens/contracts/erc-1155/ERC1155Gebrid.sol";
import {ERC1155GebridFactoryC2} from "@gebrid/tokens/contracts/create-2/ERC1155GebridFactoryC2.sol";

//meta tokens
import {ERC721GebridMeta} from "@gebrid/tokens/contracts/erc-721-minimal/erc-721-minimal-meta/ERC721GebridMeta.sol";
import {ERC1155GebridMeta} from "@gebrid/tokens/contracts/erc-1155/erc-1155-meta/ERC1155GebridMeta.sol";

//beacons
import {ERC1155GebridBeacon} from "@gebrid/tokens/contracts/beacons/ERC1155GebridBeacon.sol";
import {ERC721GebridMinimalBeacon} from "@gebrid/tokens/contracts/beacons/ERC721GebridMinimalBeacon.sol";
import {ERC721GebridBeacon} from "@gebrid/tokens/contracts/beacons/ERC721GebridBeacon.sol";
import {ERC1155GebridBeaconMeta} from "@gebrid/tokens/contracts/beacons/ERC1155GebridBeaconMeta.sol";
import {ERC721GebridMinimalBeaconMeta} from "@gebrid/tokens/contracts/beacons/ERC721GebridMinimalBeaconMeta.sol";



