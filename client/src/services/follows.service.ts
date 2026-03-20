import api from '../config/api';

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  const response = await api.get('/follows/check', {
    params: { followingId }
  });
  return response.data.isFollowing;
};

export const followUser = async (followerId: string, followingId: string) => {
  const response = await api.post('/follows', { followingId });
  return response.data;
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  const response = await api.delete(`/follows/${followingId}`);
  return response.data;
};
