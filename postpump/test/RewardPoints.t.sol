// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {RewardPoints} from "../src/RewardPoints.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract RewardPointsTest is Test {
    RewardPoints public rewardPoints;
    
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);

    function setUp() public {
        vm.startPrank(owner);
        rewardPoints = new RewardPoints();
        vm.stopPrank();
    }

    function testInitialParameters() public {
        assertEq(rewardPoints.owner(), owner);
        assertEq(rewardPoints.POINTS_FOR_POSTING(), 10 * 10**18);
        assertEq(rewardPoints.postCounter(), 0);
    }

    function testCreatePost() public {
        vm.startPrank(user1);
        rewardPoints.createPost();
        
        // Check user points
        assertEq(rewardPoints.userPoints(user1), 10 * 10**18);
        assertEq(rewardPoints.totalPointsEarned(user1), 10 * 10**18);
        assertEq(rewardPoints.userPostCount(user1), 1);
        
        // Check post creation
        assertEq(rewardPoints.postCounter(), 1);
        assertEq(rewardPoints.getPostOwner(1), user1);
        vm.stopPrank();
    }

    function testMultiplePosts() public {
        vm.startPrank(user1);
        rewardPoints.createPost();
        rewardPoints.createPost();
        
        assertEq(rewardPoints.userPoints(user1), 20 * 10**18);
        assertEq(rewardPoints.userPostCount(user1), 2);
        assertEq(rewardPoints.postCounter(), 2);
        vm.stopPrank();
        
        vm.startPrank(user2);
        rewardPoints.createPost();
        assertEq(rewardPoints.userPostCount(user2), 1);
        assertEq(rewardPoints.postCounter(), 3);
        vm.stopPrank();
    }

    function testInvestInPost() public {
        // First create a post
        vm.startPrank(user1);
        uint256 postId = rewardPoints.createPost("Test Title", "Test Content");
        vm.stopPrank();
        
        // User2 invests in the post
        vm.startPrank(user2);
        rewardPoints.adminMint(user2, 50 * 10**18); // First give user2 points
        rewardPoints.investInPost(postId, 10 * 10**18);
        
        // Check if post points were updated
        (, , , , uint256 points) = rewardPoints.getPost(postId);
        assertEq(points, 10 * 10**18);
        
        // Check if user2's investment is recorded
        uint256 investment = rewardPoints.getPostInvestment(postId, user2);
        assertEq(investment, 10 * 10**18);
        
        // Check user points
        assertEq(rewardPoints.userPoints(user2), 40 * 10**18);
        vm.stopPrank();
    }

    function testMultipleInvestments() public {
        // First create a post
        vm.startPrank(user1);
        uint256 postId = rewardPoints.createPost("Test Title", "Test Content");
        vm.stopPrank();
        
        // User2 invests in the post multiple times
        vm.startPrank(user2);
        rewardPoints.adminMint(user2, 50 * 10**18); // First give user2 points
        rewardPoints.investInPost(postId, 10 * 10**18);
        rewardPoints.investInPost(postId, 5 * 10**18);
        
        // Check post points
        (, , , , uint256 points) = rewardPoints.getPost(postId);
        assertEq(points, 15 * 10**18);
        
        // Check user's investment
        uint256 investment = rewardPoints.getPostInvestment(postId, user2);
        assertEq(investment, 15 * 10**18);
        
        // Check user points
        assertEq(rewardPoints.userPoints(user2), 35 * 10**18);
        vm.stopPrank();
    }

    function testWithdrawInvestment() public {
        // First create a post
        vm.startPrank(user1);
        uint256 postId = rewardPoints.createPost("Test Title", "Test Content");
        vm.stopPrank();
        
        // User2 invests in the post
        vm.startPrank(user2);
        rewardPoints.adminMint(user2, 50 * 10**18); // First give user2 points
        rewardPoints.investInPost(postId, 10 * 10**18);
        
        // Withdraw part of the investment
        rewardPoints.withdrawInvestment(postId, 3 * 10**18);
        
        // Check post points
        (, , , , uint256 points) = rewardPoints.getPost(postId);
        assertEq(points, 7 * 10**18);
        
        // Check user's investment
        uint256 investment = rewardPoints.getPostInvestment(postId, user2);
        assertEq(investment, 7 * 10**18);
        
        // Check user points
        assertEq(rewardPoints.userPoints(user2), 43 * 10**18);
        vm.stopPrank();
    }

    function testAdminMint() public {
        vm.startPrank(owner);
        rewardPoints.adminMint(user1, 100 * 10**18);
        
        assertEq(rewardPoints.userPoints(user1), 100 * 10**18);
        assertEq(rewardPoints.totalPointsEarned(user1), 100 * 10**18);
        vm.stopPrank();
    }

    function testRevertWhenInvestInsufficientPoints() public {
        vm.startPrank(user1);
        // 创建帖子
        uint256 postId = rewardPoints.createPost("Test Title", "Test Content");
        vm.stopPrank();
        
        vm.startPrank(user2);
        // 尝试投资但没有足够积分
        vm.expectRevert("Insufficient points balance");
        rewardPoints.investInPost(postId, 5 * 10**18);
        vm.stopPrank();
    }

    function testRevertWhenWithdrawMoreThanInvested() public {
        vm.startPrank(user1);
        // 创建帖子
        uint256 postId = rewardPoints.createPost("Test Title", "Test Content");
        vm.stopPrank();
        
        vm.startPrank(user2);
        // 给用户积分
        rewardPoints.adminMint(user2, 50 * 10**18);
        
        // 投资积分到帖子
        rewardPoints.investInPost(postId, 5 * 10**18);
        
        // 尝试撤回比投资更多的积分
        vm.expectRevert("Insufficient invested points");
        rewardPoints.withdrawInvestment(postId, 10 * 10**18);
        vm.stopPrank();
    }

    function testRevertWhenNonOwnerMint() public {
        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user1));
        rewardPoints.adminMint(user1, 100 * 10**18);
        vm.stopPrank();
    }
}