// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {RewardPoints} from "../src/RewardPoints.sol";

contract RewardPointsScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        RewardPoints rewardPoints = new RewardPoints();
        console.log("RewardPoints deployed at:", address(rewardPoints));

        vm.stopBroadcast();
    }
}