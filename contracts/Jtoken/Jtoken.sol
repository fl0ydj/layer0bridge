// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "../OFT.sol";

/// @title A LayerZero OmnichainFungibleToken example using OFT
/// @notice Works in tandem with a BasedOFT. Use this to contract on for all NON-BASE chains. It burns tokens on send(), and mints on receive tokens form other chains.
contract Jtoken is OFT {
    constructor(address _layerZeroEndpoint) OFT("J", "J", _layerZeroEndpoint) {}
}
