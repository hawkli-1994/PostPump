import React, { useState } from 'react';

const PostItem = ({ post, account, onInvest, onLaunch }) => {
  const [investAmount, setInvestAmount] = useState('');
  const [showInvestForm, setShowInvestForm] = useState(false);
  const [showLaunchAnimation, setShowLaunchAnimation] = useState(false);

  const handleInvest = (e) => {
    e.preventDefault();
    if (investAmount && parseInt(investAmount) > 0) {
      onInvest(post.id, investAmount);
      setInvestAmount('');
      setShowInvestForm(false);
    }
  };

  const handleQuickInvest = () => {
    onInvest(post.id, 1);
  };

  const handleLaunch = () => {
    // 显示发射动画
    setShowLaunchAnimation(true);
    // 调用父组件的onLaunch方法
    onLaunch(post.id);
    // 3秒后隐藏动画
    setTimeout(() => {
      setShowLaunchAnimation(false);
    }, 3000);
  };

  // 计算进度百分比 (基于5个积分的阈值)
  const progressPercentage = Math.min(100, (post.points / 5) * 100);
  
  // 检查是否可以发射代币
  const canLaunchToken = post.ownerAddress === account && post.points >= 5 && !post.tokenAddress;

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
      
      {/* 进度条 */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
          <span className="rocket-icon">🚀</span>
        </div>
        <div className="progress-text">
          {post.points}/5 points to launch
        </div>
      </div>
      
      {account && (
        <div className="post-actions">
          <button onClick={handleQuickInvest} className="quick-invest-button">
            +1 Point
          </button>
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
      
      {/* 发射按钮和动画 */}
      {canLaunchToken && (
        <div className="token-actions">
          <button onClick={handleLaunch}>Launch Token</button>
        </div>
      )}
      
      {showLaunchAnimation && (
        <div className="launch-animation">
          <div className="rocket-launch">
            <span className="rocket">🚀</span>
          </div>
          <div className="success-message">Token Launch Successful!</div>
        </div>
      )}
    </div>
  );
};

export default PostItem;