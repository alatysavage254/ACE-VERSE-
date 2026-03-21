import api from '../config/api';

export const getComments = async (postId: string) => {
  const response = await api.get(`/comments/post/${postId}`);
  return response.data;
};

export const addComment = async (postId: string, _userId: string, _username: string, text: string) => {
  const response = await api.post('/comments', {
    postId,
    text
  });
  return response.data;
};
