import { useState, useEffect } from 'react';
import { getComments, addComment } from '../services/comments.service';
import type { Comment } from '../types';

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getComments(postId);
        const commentsWithId = data.map((c: any) => ({ ...c, id: c._id }));
        setComments(commentsWithId);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [postId]);

  const addNewComment = async (userId: string, username: string, text: string) => {
    setLoading(true);
    try {
      const newComment = await addComment(postId, userId, username, text);
      setComments(prev => [{ ...newComment, id: newComment._id }, ...prev]);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { comments, addNewComment, loading };
};
