# PostPump

A simplified social posting platform inspired by X (Twitter), integrated with Web3 elements. Users post content to earn points, invest points in other posts to accumulate value, and when a post reaches a points threshold, the poster can launch an ERC20 token with AI-generated name and image based on the post's theme.

## Project Structure

```
PostPump/
├── backend/
│   ├── server.js          # Express backend server
│   ├── contracts/         # Smart contracts
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/               # React frontend source
│   └── package.json       # Frontend dependencies
└── postpump/
    ├── src/               # Foundry smart contracts
    └── foundry.toml       # Foundry configuration
```

## Features

1. **User Interaction and Posting**
   - Connect wallet (MetaMask) to get Ethereum address as user ID
   - Create posts with title and content (max 280 chars)
   - Automatically earn points for each post (managed on blockchain)
   - View all posts with owner, content, and current points

2. **Points Investment Mechanism**
   - Invest points in other users' posts
   - Posts accumulate points from investments
   - When a post reaches 5 points (reduced for demo purposes), token can be launched

3. **Token Launch**
   - Post owners can launch an ERC20 token when post reaches 5 points
   - Token has AI-generated name and symbol (simulated in MVP)

4. **Token Trading Simulation**
   - After launch, tokens can be traded (simulated in MVP)

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Blockchain**: 
  - Foundry for smart contract development and testing
  - Hardhat for additional tooling
  - Solidity smart contracts for point management
- **Storage**: SQLite database for post data persistence

## Setup and Run

### Prerequisites

- Node.js (v14 or higher)
- MetaMask browser extension
- Ethereum wallet with testnet ETH (Monad Testnet)

### Backend Setup

```bash
cd backend
npm install
node server.js
```

The backend will start on port 3001.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on port 5173.

### Smart Contracts

Smart contracts are developed with Foundry and located in [postpump/src/](postpump/src/).

To deploy the RewardPoints contract on Monad Testnet:

```bash
cd postpump
forge create --private-key YOUR_PRIVATE_KEY src/RewardPoints.sol:RewardPoints \
  --rpc-url https://testnet-rpc.monad.xyz \
  --chain 10143 \
  --broadcast
```

## API Endpoints

- `POST /post` - Create a new post
- `GET /posts` - Get all posts
- `POST /invest` - Invest points in a post
- `POST /launch` - Launch token for a post
- `POST /trade` - Trade tokens (simulated)
- `GET /user/:address` - Get user points from blockchain

## How to Use

1. Connect your MetaMask wallet to the app (make sure you're on Monad Testnet)
2. Create a post (you'll get points managed on blockchain)
3. Invest points in other users' posts
4. When one of your posts reaches 5 points, launch a token
5. Simulate trading tokens

## Key Components

### Blockchain Integration

- User points are managed via the RewardPoints smart contract on Monad Testnet
- Posts and investments are tracked both on-chain (points) and off-chain (post content)
- The frontend interacts directly with the blockchain for point-related operations

### Smart Contract

The main smart contract is [RewardPoints.sol](postpump/src/RewardPoints.sol) which handles:
- Point creation for posting
- Point investment in posts
- User point balances
- Post tracking

## Limitations (MVP)

- No real AI integration for token name/image generation
- No real token deployment (simulated)
- No real trading (simulated)
- Data resets when backend restarts (posts are stored in SQLite but points are on blockchain)

## Testnet Deploy Info

Deployed RewardPoints contract on Monad Testnet:

```
Deployer: 0x2dE5C1AC2568605C6Fc82173552ECfaf07883C65
Deployed to: 0x6103342bbb34d045E345AAF520f0f7A6ecEa1f4e
Transaction hash: 0x15e55a0430cd8bfbe09d2d9bf91df2c1307c460845f929050d9046702b3d13c2
```