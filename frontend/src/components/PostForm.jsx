import React, { useState } from 'react';

const PostForm = ({ onCreatePost }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onCreatePost(title, content);
      setTitle('');
      setContent('');
    }
  };

  return (
    <div className="post-form">
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>
        <div>
          <textarea
            placeholder="What's happening? (max 280 characters)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={280}
            required
          />
        </div>
        <div>
          <button type="submit">Post</button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;