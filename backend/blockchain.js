const { ethers } = require('ethers');

// RewardPoints 合约ABI
const REWARD_POINTS_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "POINTS_FOR_POSTING",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "createPost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "postId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "investInPost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "userPoints",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getAvailablePoints",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// RewardPoints 合约地址
const REWARD_POINTS_ADDRESS = '0x6103342bbb34d045E345AAF520f0f7A6ecEa1f4e';

// 使用 Monad 测试网 RPC (chain_id: 10143)
const provider = new ethers.providers.JsonRpcProvider('https://testnet-rpc.monad.xyz');

// 创建合约实例（只读）
const rewardPointsContract = new ethers.Contract(
  REWARD_POINTS_ADDRESS,
  REWARD_POINTS_ABI,
  provider
);

/**
 * 获取用户积分余额
 * @param {string} userAddress - 用户地址
 * @returns {Promise<number>} 用户积分余额
 */
async function getUserPoints(userAddress) {
  try {
    const points = await rewardPointsContract.userPoints(userAddress);
    return ethers.utils.formatEther(points);
  } catch (error) {
    console.error('Error fetching user points from blockchain:', error);
    throw error;
  }
}

/**
 * 获取用户可用积分
 * @param {string} userAddress - 用户地址
 * @returns {Promise<number>} 用户可用积分
 */
async function getAvailablePoints(userAddress) {
  try {
    const points = await rewardPointsContract.getAvailablePoints(userAddress);
    return ethers.utils.formatEther(points);
  } catch (error) {
    console.error('Error fetching available points from blockchain:', error);
    throw error;
  }
}

module.exports = {
  getUserPoints,
  getAvailablePoints
};