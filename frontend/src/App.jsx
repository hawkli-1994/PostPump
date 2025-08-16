import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import PostForm from './components/PostForm';
import PostList from './components/PostList';
import useRewardPoints from './hooks/useRewardPoints';

// 从环境变量获取API基础URL，如果没有设置则使用默认值
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  
  // 使用新的积分系统hook
  const rewardPoints = useRewardPoints(account, provider);
  
  // 添加调试日志
  useEffect(() => {
    console.log('Account updated:', account);
  }, [account]);
  
  useEffect(() => {
    console.log('Provider updated:', provider);
  }, [provider]);

  // Connect to MetaMask
  const connectWallet = async () => {
    // 更完善的检查机制，确保在各种环境下都能正确检测
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);
      
        // 检查 window.ethereum 是否存在并创建 BrowserProvider (兼容 ethers v6)
        if (window.ethereum) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);
          
          // 检查网络是否为Monad测试网
          const network = await web3Provider.getNetwork();
          if (network.chainId !== 10143) {
            console.warn('当前连接的网络不是Monad测试网，建议切换到Monad测试网');
          }
        } else {
          console.error('Web3Provider not available');
          return;
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('连接钱包时发生错误: ' + error.message);
      }
    } else {
      // 提供更详细的错误信息
      if (typeof window === 'undefined') {
        alert('当前环境不支持钱包连接');
      } else if (!window.ethereum) {
        alert('请安装MetaMask或其他兼容的钱包插件后再试！');
      } else {
        alert('未检测到可用的以太坊钱包');
      }
    }
  };

  // Fetch user points (保留原有的后端获取积分方式作为备选)
  const fetchUserPointsFromBackend = async () => {
    if (!account) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/${account}`);
      if (response.ok) {
        const userData = await response.json();
        setUserPoints(userData.points);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  // Create a new post
  const createPost = async (title, content) => {
    console.log('createPost called with:', { title, content });
    
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      // 首先调用区块链合约创建帖子并获得积分
      console.log('Calling rewardPoints.createPost()');
      const result = await rewardPoints.createPost();
      console.log('Blockchain createPost result:', result);
      
      if (!result.success) {
        alert('Failed to create post on blockchain: ' + result.error);
        return;
      }
      
      // 然后调用后端API创建帖子记录
      console.log('Calling backend API to create post');
      const response = await fetch(`${API_BASE_URL}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerAddress: account,
          title,
          content
        }),
      });

      if (response.ok) {
        console.log('Backend post creation successful');
        fetchPosts();
        // 使用区块链积分系统获取积分
        // 积分已经在createPost中更新了
      } else {
        const error = await response.json();
        console.error('Error creating post:', error);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Invest in a post
  const investInPost = async (postId, amount) => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      await rewardPoints.investInPost(postId, amount);
      fetchPosts();
    } catch (error) {
      console.error('Error investing in post:', error);
      alert('投资失败: ' + error.message);
    }
  };

  // Launch token for a post
  const launchToken = async (postId) => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      const result = await rewardPoints.launchToken(postId);
      if (result.success) {
        alert('代币启动成功!');
        fetchPosts();
      } else {
        alert('代币启动失败: ' + result.error);
      }
    } catch (error) {
      console.error('Error launching token:', error);
      alert('代币启动失败: ' + error.message);
    }
  };

  // Fetch user points when account changes
  useEffect(() => {
    if (account) {
      // 优先使用区块链积分系统
      // 如果区块链系统不可用，则使用后端系统
    } else {
      setUserPoints(0);
    }
  }, [account, rewardPoints.userPoints]);

  // 当区块链积分更新时，更新显示的积分
  useEffect(() => {
    if (rewardPoints.userPoints > 0) {
      setUserPoints(rewardPoints.userPoints);
    }
  }, [rewardPoints.userPoints]);

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>PostPump</h1>
        {account ? (
          <div>
            <p>已连接: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
            <p>积分: {rewardPoints.userPoints}</p>
          </div>
        ) : (
          <button onClick={connectWallet}>连接钱包</button>
        )}
      </header>

      <main>
        <div className="content-wrapper">
          {account && (
            <div className="create-post-section">
              <PostForm onCreatePost={createPost} />
            </div>
          )}
          <div className="posts-section">
            <div className="posts-header">
              <h2>Posts</h2>
              <button onClick={fetchPosts}>Refresh Posts</button>
            </div>
            <PostList 
              posts={posts} 
              account={account}
              onInvest={investInPost}
              onLaunch={launchToken}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;