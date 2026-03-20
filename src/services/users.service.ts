import api from '../config/api';

export const getUserProfile = async (userId: string) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userId: string, data: { username?: string; bio?: string; photoURL?: string | null }) => {
  const response = await api.put(`/users/${userId}`, data);
  return response.data;
};

export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(file.name)}&background=random`;
};
