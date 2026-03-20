import api from '../config/api';

export const getPosts = async (userId?: string, limit = 10, cursor?: string) => {
  const params: any = { limit };
  if (userId) params.userId = userId;
  if (cursor) params.cursor = cursor;
  
  const response = await api.get('/posts', { params });
  return response.data;
};

export const getUserPosts = async (userId: string) => {
  const response = await api.get(`/posts/user/${userId}`);
  return response.data;
};

export const createPost = async (userId: string, username: string, title: string, description: string, imageUrl?: string) => {
  const response = await api.post('/posts', {
    title,
    description,
    imageUrl: imageUrl || ''
  });
  return response.data;
};

export const deletePostWithRelations = async (postId: string) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};
