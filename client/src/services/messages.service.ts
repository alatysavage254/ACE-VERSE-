import api from '../config/api';

export interface Message {
  _id: string;
  senderId: {
    _id: string;
    username: string;
    photoURL: string;
  };
  receiverId: {
    _id: string;
    username: string;
    photoURL: string;
  };
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  user: {
    _id: string;
    username: string;
    photoURL: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

export const getMessages = async (userId: string): Promise<Message[]> => {
  const response = await api.get(`/messages/${userId}`);
  return response.data;
};

export const sendMessage = async (receiverId: string, content: string): Promise<Message> => {
  const response = await api.post('/messages', { receiverId, content });
  return response.data;
};

export const markAsRead = async (userId: string): Promise<void> => {
  await api.put(`/messages/read/${userId}`);
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  await api.delete(`/messages/${messageId}`);
};
