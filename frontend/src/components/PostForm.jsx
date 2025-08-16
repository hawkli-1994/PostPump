import React, { useState } from 'react';

const PostForm = ({ onCreatePost }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [touched, setTouched] = useState(false);

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
      <form onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (content.trim()) {
            onCreatePost(title, content);
            setTitle('');
            setContent('');
            setTouched(false);
          }
        }}
      >
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
            onBlur={() => setTouched(true)}
            maxLength={280}
            required
          />
        </div>
        <div>
          <button type="submit">Post</button>
        </div>
        {touched && !content.trim() && (
          <div className="error-message">Content cannot be empty.</div>
        )}
      </form>
    </div>
  );
};

export default PostForm;