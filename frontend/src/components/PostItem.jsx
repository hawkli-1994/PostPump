import React, { useState } from 'react';

const PostItem = ({ post, account, onInvest, onLaunch }) => {
  const [investAmount, setInvestAmount] = useState('');
  const [showInvestForm, setShowInvestForm] = useState(false);

  const handleInvest = (e) => {
    e.preventDefault();
    if (investAmount && parseInt(investAmount) > 0) {
      onInvest(post.id, investAmount);
      setInvestAmount('');
      setShowInvestForm(false);
    }
  };

  const canLaunchToken = post.ownerAddress === account && post.points >= 100 && !post.tokenAddress;

  return (
    <div className="post-item">
      <div className="post-header">
        <span className="post-owner">
          {post.ownerAddress.substring(0, 6)}...{post.ownerAddress.substring(post.ownerAddress.length - 4)}
        </span>
        {post.title && <h3>{post.title}</h3>}
      </div>
      <div className="post-content">
        <p>{post.content}</p>
      </div>
      <div className="post-stats">
        <span>Points: {post.points}</span>
        {post.tokenAddress && (
          <span className="token-info">
            Token: {post.tokenName} ({post.tokenSymbol}) - {post.tokenAddress.substring(0, 6)}...{post.tokenAddress.substring(post.tokenAddress.length - 4)}
          </span>
        )}
      </div>
      
      {account && post.ownerAddress !== account && (
        <div className="post-actions">
          {!showInvestForm ? (
            <button onClick={() => setShowInvestForm(true)}>Invest</button>
          ) : (
            <form onSubmit={handleInvest} className="invest-form">
              <input
                type="number"
                placeholder="Amount"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                min="1"
              />
              <button type="submit">Confirm</button>
              <button type="button" onClick={() => setShowInvestForm(false)}>Cancel</button>
            </form>
          )}
        </div>
      )}
      
      {canLaunchToken && (
        <div className="token-actions">
          <button onClick={() => onLaunch(post.id)}>Launch Token</button>
        </div>
      )}
    </div>
  );
};

export default PostItem;