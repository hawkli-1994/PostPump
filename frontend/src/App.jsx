import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import PostForm from './components/PostForm';
import PostList from './components/PostList';
import useRewardPoints from './hooks/useRewardPoints';

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
    if (typeof window.ethereum !== 'undefined') {
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
      }
    } else {
      alert('MetaMask is not installed!');
    }
  };

  // Fetch user points (保留原有的后端获取积分方式作为备选)
  const fetchUserPointsFromBackend = async () => {
    if (!account) return;
    
    try {
      const response = await fetch(`http://localhost:3001/user/${account}`);
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
      const response = await fetch('http://localhost:3001/posts');
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
      const response = await fetch('http://localhost:3001/post', {
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
      // 首先调用区块链合约进行投资
      const result = await rewardPoints.investInPost(postId, amount);
      if (!result.success) {
        alert('Failed to invest on blockchain: ' + result.error);
        return;
      }
      
      // 然后调用后端API记录投资
      const response = await fetch('http://localhost:3001/invest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: account,
          postId,
          amount: parseInt(amount)
        }),
      });

      if (response.ok) {
        fetchPosts();
        // 使用区块链积分系统获取积分
        // 积分已经在investInPost中更新了
      } else {
        const error = await response.json();
        console.error('Error investing:', error);
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error investing:', error);
    }
  };

  // Launch token for a post
  const launchToken = async (postId) => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: account,
          postId
        }),
      });

      if (response.ok) {
        fetchPosts();
      } else {
        const error = await response.json();
        console.error('Error launching token:', error);
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error launching token:', error);
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
            <p>Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
            <p>Points: {userPoints}</p>
            <button onClick={() => {
              setAccount(null);
              setProvider(null);
            }}>Disconnect</button>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
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