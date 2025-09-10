import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface PostProps {
  id: string;
  title: string;
  description: string;
  username: string;
  userId: string;
  onDelete?: () => void;
}

export const Post = ({ id, title, description, username, userId, onDelete }: PostProps) => {
  const [user] = useAuthState(auth);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user || deleting) return;
    
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const postDoc = doc(db, 'posts', id);
      await deleteDoc(postDoc);
      onDelete?.();
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      setError(err?.message || 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="post" style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
      <h3>{title}</h3>
      <p>{description}</p>
      <p>Posted by: {username}</p>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {user?.uid === userId && (
        <button 
          onClick={handleDelete} 
          disabled={deleting}
          style={{ 
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            cursor: deleting ? 'not-allowed' : 'pointer',
            opacity: deleting ? 0.7 : 1
          }}
        >
          {deleting ? 'Deleting...' : 'Delete Post'}
        </button>
      )}
    </div>
  );
};
