import React, { useState, useEffect } from 'react';
import './App.css';
import PostForm from './components/PostForm';
import PostList from './components/PostList';

function App() {
  const [account, setAccount] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userPoints, setUserPoints] = useState(0);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('MetaMask is not installed!');
    }
  };

  // Fetch user points
  const fetchUserPoints = async () => {
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
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
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
        fetchPosts();
        fetchUserPoints(); // Update user points after creating a post
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
        fetchUserPoints(); // Update user points after investing
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
      fetchUserPoints();
    } else {
      setUserPoints(0);
    }
  }, [account]);

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
            <button onClick={() => setAccount(null)}>Disconnect</button>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </header>

      <main>
        {account && <PostForm onCreatePost={createPost} />}
        <div className="posts-section">
          <h2>Posts</h2>
          <button onClick={fetchPosts}>Refresh Posts</button>
          <PostList 
            posts={posts} 
            account={account}
            onInvest={investInPost}
            onLaunch={launchToken}
          />
        </div>
      </main>
    </div>
  );
}

export default App;