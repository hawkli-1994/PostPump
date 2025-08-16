import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// RewardPoints 合约ABI（只包含我们需要的函数）
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

// RewardPoints 合约地址（我们刚刚部署的地址）
const REWARD_POINTS_ADDRESS = '0x6103342bbb34d045E345AAF520f0f7A6ecEa1f4e';

const useRewardPoints = (account, provider) => {
  const [userPoints, setUserPoints] = useState(0);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    console.log('useRewardPoints hook called with:', { account, provider });
    
    if (account && provider) {
      try {
        console.log('Initializing contract with signer');
        const rewardPointsContract = new ethers.Contract(
          REWARD_POINTS_ADDRESS,
          REWARD_POINTS_ABI,
          provider.getSigner()
        );
        setContract(rewardPointsContract);
        setInitError(null);
        fetchUserPoints(rewardPointsContract);
      } catch (error) {
        console.error('Error initializing contract:', error);
        setInitError('合约初始化失败: ' + error.message);
      }
    } else if (provider) {
      // 即使没有账户，也创建只读合约实例
      try {
        console.log('Initializing read-only contract');
        const readOnlyContract = new ethers.Contract(
          REWARD_POINTS_ADDRESS,
          REWARD_POINTS_ABI,
          provider
        );
        setContract(readOnlyContract);
        setInitError(null);
      } catch (error) {
        console.error('Error initializing read-only contract:', error);
        setInitError('只读合约初始化失败: ' + error.message);
      }
    } else {
      console.log('Provider is null, cannot initialize contract');
      setInitError('Provider未初始化');
    }
  }, [account, provider]);

  const fetchUserPoints = async (contractInstance) => {
    if (!account || !contractInstance) return;
    
    try {
      const points = await contractInstance.userPoints(account);
      setUserPoints(ethers.utils.formatEther(points));
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const createPost = async () => {
    console.log('useRewardPoints.createPost called');
    if (!account) {
      console.log('Missing account', { account });
      return { success: false, error: '请先连接钱包账户!' };
    }
    
    if (!contract) {
      console.log('Missing contract', { contract });
      return { success: false, error: initError || '合约未初始化，请刷新页面重试!' };
    }
    
    setLoading(true);
    try {
      console.log('Sending createPost transaction');
      const tx = await contract.createPost();
      console.log('Transaction sent:', tx);
      await tx.wait();
      console.log('Transaction confirmed');
      await fetchUserPoints(contract);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      console.error('Error creating post:', error);
      return { success: false, error: error.message };
    }
  };

  const investInPost = async (postId, amount) => {
    if (!account) {
      return { success: false, error: '请先连接钱包账户!' };
    }
    
    if (!contract) {
      return { success: false, error: initError || '合约未初始化，请刷新页面重试!' };
    }
    
    setLoading(true);
    try {
      const tx = await contract.investInPost(
        postId,
        ethers.utils.parseEther(amount.toString())
      );
      await tx.wait();
      await fetchUserPoints(contract);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      console.error('Error investing in post:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    userPoints,
    loading,
    createPost,
    investInPost,
    fetchUserPoints
  };
};

export default useRewardPoints;