import api from '../config/api';

export const getLikes = async (postId: string) => {
  const response = await api.get(`/likes/post/${postId}`);
  return response.data;
};

export const addLike = async (postId: string) => {
  const response = await api.post('/likes', { postId });
  return response.data;
};

export const removeLike = async (postId: string) => {
  const response = await api.delete(`/likes/${postId}`);
  return response.data;
};
