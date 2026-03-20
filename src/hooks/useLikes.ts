import { useState, useEffect } from 'react';
import { getLikes, addLike, removeLike } from '../services/likes.service';
import type { Like } from '../types';

export const useLikes = (postId: string, userId?: string) => {
  const [likes, setLikes] = useState<Like[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const data = await getLikes(postId);
        const likesWithId = data.map((l: any) => ({ ...l, id: l._id }));
        setLikes(likesWithId);
        if (userId) {
          setIsLiked(data.some((l: any) => l.userId === userId));
        }
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };

    fetchLikes();
  }, [postId, userId]);

  const toggleLike = async () => {
    if (!userId || loading) return;

    setLoading(true);
    try {
      if (isLiked) {
        await removeLike(postId);
        setLikes(prev => prev.filter(l => l.userId !== userId));
        setIsLiked(false);
      } else {
        const newLike = await addLike(postId);
        setLikes(prev => [...prev, { ...newLike, id: newLike._id }]);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return { likes, isLiked, toggleLike, loading };
};
