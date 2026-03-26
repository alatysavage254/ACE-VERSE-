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

export const createPost = async (_userId: string, _username: string, title: string, description: string, imageUrl?: string) => {
  console.log('createPost service called', { title, description, imageUrl: imageUrl ? 'has image' : 'no image' });
  console.log('Token in localStorage:', localStorage.getItem('token') ? 'exists' : 'missing');
  const response = await api.post('/posts', {
    title,
    description,
    imageUrl: imageUrl || ''
  });
  console.log('createPost response:', response.data);
  return response.data;
};

export const deletePostWithRelations = async (postId: string) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

export const searchPostsByHashtag = async (tag: string, limit = 20, cursor?: string) => {
  const params: any = { limit };
  if (cursor) params.cursor = cursor;
  
  const response = await api.get(`/posts/hashtag/${tag}`, { params });
  return response.data;
};

export const searchUsers = async (query: string, limit = 10) => {
  const response = await api.get('/posts/search/users', {
    params: { q: query, limit }
  });
  return response.data;
};

export const repostPost = async (postId: string) => {
  const response = await api.post(`/posts/${postId}/repost`);
  return response.data;
};

export const deleteRepost = async (postId: string) => {
  const response = await api.delete(`/posts/${postId}/repost`);
  return response.data;
};
