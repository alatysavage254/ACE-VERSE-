import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import styles from '../styles/post.module.css';

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
    <div className={styles.post}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <p className={styles.author}>{username}</p>
      
      {error && <p className={styles.error}>{error}</p>}
      
      {user?.uid === userId && (
        <button 
          onClick={handleDelete} 
          disabled={deleting}
          className={styles.deleteButton}
        >
          {deleting ? 'Deleting...' : 'Delete Post'}
        </button>
      )}
    </div>
  );
};
