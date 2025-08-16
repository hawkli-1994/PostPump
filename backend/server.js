const express = require('express');
const cors = require('cors');
const { getUserPoints } = require('./blockchain');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3001;

// Initialize SQLite database
const db = new sqlite3.Database('./posts.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    // Create posts table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerAddress TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      investors TEXT,
      tokenAddress TEXT,
      tokenName TEXT,
      tokenSymbol TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating posts table:', err);
      } else {
        console.log('Posts table ready');
      }
    });
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'PostPump API' });
});

// Get user points from blockchain
app.get('/user/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const points = await getUserPoints(address);
    res.json({ address, points: parseFloat(points) });
  } catch (error) {
    console.error('Error fetching user points:', error);
    // Fallback to in-memory storage if blockchain is unavailable
    const points = 0;
    res.json({ address, points });
  }
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
  
  // Insert new post into database
  const insertQuery = `INSERT INTO posts (ownerAddress, title, content, points, investors) 
                       VALUES (?, ?, ?, ?, ?)`;
  const initialValues = [
    ownerAddress,
    title || '',
    content,
    0,
    JSON.stringify({}) // Empty investors object as JSON string
  ];
  
  db.run(insertQuery, initialValues, function(err) {
    if (err) {
      console.error('Error inserting post:', err);
      return res.status(500).json({ error: 'Failed to create post' });
    }
    
    // Return the newly created post
    const newPost = {
      id: this.lastID,
      ownerAddress,
      title: title || '',
      content,
      points: 0,
      investors: {}
    };
    
    res.status(201).json(newPost);
  });
});

// Get all posts
app.get('/posts', (req, res) => {
  db.all('SELECT * FROM posts', (err, rows) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
    
    // Parse investors JSON strings back to objects
    const posts = rows.map(row => ({
      ...row,
      investors: row.investors ? JSON.parse(row.investors) : {}
    }));
    
    res.json(posts);
  });
});

// Invest points in a post
app.post('/invest', (req, res) => {
  const { userAddress, postId, amount } = req.body;
  
  // Validate input
  if (!userAddress || !postId || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Get the post from database
  db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err) {
      console.error('Error fetching post:', err);
      return res.status(500).json({ error: 'Failed to fetch post' });
    }
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Parse investors
    const investors = post.investors ? JSON.parse(post.investors) : {};
    
    // Add points to post for display
    const newPoints = post.points + amount;
    
    // Track investment
    if (!investors[userAddress]) {
      investors[userAddress] = 0;
    }
    investors[userAddress] += amount;
    
    // Update the post in database
    db.run('UPDATE posts SET points = ?, investors = ? WHERE id = ?', 
      [newPoints, JSON.stringify(investors), postId], 
      function(err) {
        if (err) {
          console.error('Error updating post:', err);
          return res.status(500).json({ error: 'Failed to update post' });
        }
        
        const updatedPost = {
          ...post,
          points: newPoints,
          investors
        };
        
        res.json({ message: 'Investment successful', post: updatedPost });
      }
    );
  });
});

// Launch token for a post
app.post('/launch', (req, res) => {
  const { postId, userAddress } = req.body;
  
  // Find the post
  db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err) {
      console.error('Error fetching post:', err);
      return res.status(500).json({ error: 'Failed to fetch post' });
    }
    
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
    const tokenAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    const tokenName = `Token${postId}`;
    const tokenSymbol = `TKN${postId}`;
    
    // Update post with token info
    db.run('UPDATE posts SET tokenAddress = ?, tokenName = ?, tokenSymbol = ? WHERE id = ?', 
      [tokenAddress, tokenName, tokenSymbol, postId], 
      function(err) {
        if (err) {
          console.error('Error updating post with token info:', err);
          return res.status(500).json({ error: 'Failed to update post' });
        }
        
        res.json({
          message: 'Token launched successfully',
          tokenAddress,
          tokenName,
          tokenSymbol
        });
      }
    );
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
  db.get('SELECT * FROM posts WHERE tokenAddress = ?', [tokenAddress], (err, post) => {
    if (err) {
      console.error('Error fetching post:', err);
      return res.status(500).json({ error: 'Failed to fetch post' });
    }
    
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
});

// Gracefully close database connection when server shuts down
process.on('exit', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
  });
});

app.listen(PORT, () => {
  console.log(`PostPump backend listening on port ${PORT}`);
});