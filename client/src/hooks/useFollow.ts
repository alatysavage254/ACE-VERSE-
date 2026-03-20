import { useState, useEffect } from 'react';
import { followUser, unfollowUser, isFollowing } from '../services/follows.service';

export const useFollow = (currentUserId?: string, targetUserId?: string) => {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserId && targetUserId && currentUserId !== targetUserId) {
      isFollowing(currentUserId, targetUserId).then(setFollowing);
    }
  }, [currentUserId, targetUserId]);

  const toggleFollow = async () => {
    if (!currentUserId || !targetUserId || loading) return;
    
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(currentUserId, targetUserId);
        setFollowing(false);
      } else {
        await followUser(currentUserId, targetUserId);
        setFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return { following, toggleFollow, loading };
};
