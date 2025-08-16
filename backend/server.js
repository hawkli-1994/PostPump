const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// In-memory storage
let posts = [];
let users = {};
let postIdCounter = 1;

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'PostPump API' });
});

// Get user points
app.get('/user/:address', (req, res) => {
  const { address } = req.params;
  const points = users[address] || 0;
  res.json({ address, points });
});

// Create a new post
app.post('/post', (req, res) => {
  const { ownerAddress, title, content } = req.body;
  
  // Validate input
  if (!ownerAddress || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (content.length > 280) {
    return res.status(400).json({ error: 'Content too long' });
  }
  
  // Create new post
  const newPost = {
    id: postIdCounter++,
    ownerAddress,
    title: title || '',
    content,
    points: 0,
    investors: {}
  };
  
  posts.push(newPost);
  
  // Reward user with 10 points
  if (!users[ownerAddress]) {
    users[ownerAddress] = 0;
  }
  users[ownerAddress] += 10;
  
  res.status(201).json(newPost);
});

// Get all posts
app.get('/posts', (req, res) => {
  res.json(posts);
});

// Invest points in a post
app.post('/invest', (req, res) => {
  const { userAddress, postId, amount } = req.body;
  
  // Validate input
  if (!userAddress || !postId || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Find the post
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  // Check if user has enough points
  if (!users[userAddress] || users[userAddress] < amount) {
    return res.status(400).json({ error: 'Not enough points' });
  }
  
  // Deduct points from user
  users[userAddress] -= amount;
  
  // Add points to post
  post.points += amount;
  
  // Track investment
  if (!post.investors[userAddress]) {
    post.investors[userAddress] = 0;
  }
  post.investors[userAddress] += amount;
  
  res.json({ message: 'Investment successful', post });
});

// Launch token for a post
app.post('/launch', (req, res) => {
  const { postId, userAddress } = req.body;
  
  // Find the post
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  // Check if user is the owner
  if (post.ownerAddress !== userAddress) {
    return res.status(403).json({ error: 'Only the owner can launch a token' });
  }
  
  // Check if post has enough points
  if (post.points < 100) {
    return res.status(400).json({ error: 'Not enough points to launch token' });
  }
  
  // Check if token is already launched
  if (post.tokenAddress) {
    return res.status(400).json({ error: 'Token already launched for this post' });
  }
  
  // For demo purposes, we'll just simulate token creation
  // In a real implementation, this would deploy an ERC20 contract
  post.tokenAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
  post.tokenName = `Token${postId}`;
  post.tokenSymbol = `TKN${postId}`;
  
  res.json({
    message: 'Token launched successfully',
    tokenAddress: post.tokenAddress,
    tokenName: post.tokenName,
    tokenSymbol: post.tokenSymbol
  });
});

// Simulate token trading
app.post('/trade', (req, res) => {
  const { userAddress, tokenAddress, action, amount } = req.body;
  
  // Validate input
  if (!userAddress || !tokenAddress || !action || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (action !== 'buy' && action !== 'sell') {
    return res.status(400).json({ error: 'Invalid action' });
  }
  
  // Find the post with this token
  const post = posts.find(p => p.tokenAddress === tokenAddress);
  if (!post) {
    return res.status(404).json({ error: 'Token not found' });
  }
  
  // For demo purposes, we'll just simulate the trade
  // In a real implementation, this would interact with the blockchain
  res.json({
    message: `Successfully ${action} ${amount} tokens`,
    tokenAddress,
    action,
    amount
  });
});

app.listen(PORT, () => {
  console.log(`PostPump backend listening on port ${PORT}`);
});