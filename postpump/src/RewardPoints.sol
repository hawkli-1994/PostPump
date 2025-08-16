// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RewardPoints
 * @dev 积分管理合约，用于管理用户在 PostPump 平台上的积分
 */
contract RewardPoints is ERC20, Ownable {
    // 用户积分余额映射
    mapping(address => uint256) public userPoints;
    
    // 记录用户投资到特定帖子的积分
    mapping(address => mapping(uint256 => uint256)) public pointsInvestedInPost;
    
    // 用户获得的总积分
    mapping(address => uint256) public totalPointsEarned;
    
    // 每发布一个帖子获得的积分奖励
    uint256 public constant POINTS_FOR_POSTING = 10 * 10 ** 18; // 10 points with 18 decimals
    
    // 积分名称和符号
    string public constant POINTS_NAME = "PostPump Reward Points";
    string public constant POINTS_SYMBOL = "PPP";
    
    // 记录用户创建的帖子数量
    mapping(address => uint256) public userPostCount;
    
    // 帖子结构
    struct Post {
        uint256 id;
        address owner;
        string title;
        string content;
        uint256 points;
        mapping(address => uint256) investors;
    }
    
    // 帖子映射
    mapping(uint256 => Post) public posts;
    
    // 帖子ID计数器
    uint256 public postCounter;

    event PointsEarned(address indexed user, uint256 amount);
    event PointsInvested(address indexed user, uint256 indexed postId, uint256 amount);
    event InvestmentWithdrawn(address indexed user, uint256 indexed postId, uint256 amount);
    event PostCreated(uint256 indexed postId, address indexed owner, string title, string content);
    event PostInvested(uint256 indexed postId, address indexed investor, uint256 amount);

    constructor() ERC20(POINTS_NAME, POINTS_SYMBOL) Ownable(msg.sender) {}

    /**
     * @dev 用户发布帖子时获得积分奖励
     * @param title 帖子标题
     * @param content 帖子内容
     */
    function createPost(string memory title, string memory content) external returns (uint256) {
        postCounter++;
        uint256 postId = postCounter;
        
        Post storage newPost = posts[postId];
        newPost.id = postId;
        newPost.owner = msg.sender;
        newPost.title = title;
        newPost.content = content;
        newPost.points = 0;
        
        userPoints[msg.sender] += POINTS_FOR_POSTING;
        totalPointsEarned[msg.sender] += POINTS_FOR_POSTING;
        userPostCount[msg.sender]++;
        
        emit PointsEarned(msg.sender, POINTS_FOR_POSTING);
        emit PostCreated(postId, msg.sender, title, content);
        
        return postId;
    }

    /**
     * @dev 用户将积分投资到帖子
     * @param postId 帖子ID
     * @param amount 投资的积分数量
     */
    function investInPost(uint256 postId, uint256 amount) external {
        require(userPoints[msg.sender] >= amount, "Insufficient points balance");
        Post storage post = posts[postId];
        require(post.id != 0, "Post does not exist");
        
        userPoints[msg.sender] -= amount;
        post.points += amount;
        post.investors[msg.sender] += amount;
        pointsInvestedInPost[msg.sender][postId] += amount;
        
        emit PointsInvested(msg.sender, postId, amount);
        emit PostInvested(postId, msg.sender, amount);
    }

    /**
     * @dev 用户撤回对帖子的投资
     * @param postId 帖子ID
     * @param amount 撤回的积分数量
     */
    function withdrawInvestment(uint256 postId, uint256 amount) external {
        require(pointsInvestedInPost[msg.sender][postId] >= amount, "Insufficient invested points");
        
        pointsInvestedInPost[msg.sender][postId] -= amount;
        userPoints[msg.sender] += amount;
        
        Post storage post = posts[postId];
        post.points -= amount;
        post.investors[msg.sender] -= amount;
        
        emit InvestmentWithdrawn(msg.sender, postId, amount);
    }

    /**
     * @dev 获取帖子信息
     * @param postId 帖子ID
     * @return id, owner, title, content, points
     */
    function getPost(uint256 postId) external view returns (uint256, address, string memory, string memory, uint256) {
        Post storage post = posts[postId];
        return (post.id, post.owner, post.title, post.content, post.points);
    }
    
    /**
     * @dev 获取用户对特定帖子的投资金额
     * @param postId 帖子ID
     * @param investor 投资者地址
     * @return 投资金额
     */
    function getPostInvestment(uint256 postId, address investor) external view returns (uint256) {
        return posts[postId].investors[investor];
    }

    /**
     * @dev 获取用户可用于投资的积分余额
     * @param user 用户地址
     * @return 用户的可用积分余额
     */
    function getAvailablePoints(address user) external view returns (uint256) {
        return userPoints[user];
    }

    /**
     * @dev 获取用户总积分余额（包括已投资的积分）
     * @param user 用户地址
     * @return 用户的总积分余额
     */
    function getTotalBalance(address user) external view returns (uint256) {
        uint256 availablePoints = userPoints[user];
        uint256 investedPoints = 0;
        
        // 计算用户在所有帖子中投资的积分总数
        // 注意：这个实现是一个简化的版本，实际项目中可能需要更复杂的逻辑
        // 这里遍历用户帖子计数来估算总投资
        for (uint256 i = 0; i < userPostCount[user]; i++) {
            investedPoints += pointsInvestedInPost[user][i];
        }
        
        return availablePoints + investedPoints;
    }

    /**
     * @dev 管理员增发积分给用户（例如活动奖励）
     * @param to 接收积分的用户地址
     * @param amount 积分数量
     */
    function adminMint(address to, uint256 amount) external onlyOwner {
        userPoints[to] += amount;
        totalPointsEarned[to] += amount;
        
        emit PointsEarned(to, amount);
    }
}