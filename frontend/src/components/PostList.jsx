import React, { useState } from 'react';
import PostItem from './PostItem';

const PostList = ({ posts, account, onInvest, onLaunch }) => {
  return (
    <div className="post-list">
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to post!</p>
      ) : (
        posts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            account={account}
            onInvest={onInvest}
            onLaunch={onLaunch}
          />
        ))
      )}
    </div>
  );
};

export default PostList;