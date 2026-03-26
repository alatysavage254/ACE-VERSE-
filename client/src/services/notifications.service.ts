import api from '../config/api';

export interface Notification {
  _id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message';
  fromUserId: {
    _id: string;
    username: string;
    photoURL: string;
  };
  postId?: {
    _id: string;
    imageUrl: string;
    title: string;
  };
  commentId?: string;
  messageId?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const getNotifications = async (unreadOnly = false): Promise<Notification[]> => {
  const response = await api.get('/notifications', {
    params: { unreadOnly }
  });
  return response.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get('/notifications/unread-count');
  return response.data.count;
};

export const markAsRead = async (notificationId: string): Promise<Notification> => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllAsRead = async (): Promise<void> => {
  await api.put('/notifications/read-all');
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await api.delete(`/notifications/${notificationId}`);
};
