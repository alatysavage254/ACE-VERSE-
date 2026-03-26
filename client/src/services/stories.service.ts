import api from '../config/api';

export interface Story {
  _id: string;
  userId: string;
  username: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  thumbnail?: string;
  viewsCount: number;
  createdAt: string;
  expiresAt: string;
  hasViewed?: boolean;
}

export interface StoryGroup {
  userId: string;
  username: string;
  stories: Story[];
  hasUnviewed: boolean;
}

export interface StoryViewer {
  _id: string;
  storyId: string;
  viewerId: string;
  viewerUsername: string;
  viewedAt: string;
}

export const storiesService = {
  createStory: async (mediaUrl: string, mediaType: 'image' | 'video', thumbnail?: string): Promise<Story> => {
    const response = await api.post('/stories', { mediaUrl, mediaType, thumbnail });
    return response.data;
  },

  getFeedStories: async (): Promise<StoryGroup[]> => {
    const response = await api.get('/stories/feed');
    return response.data;
  },

  getUserStories: async (userId: string): Promise<Story[]> => {
    const response = await api.get(`/stories/user/${userId}`);
    return response.data;
  },

  recordView: async (storyId: string): Promise<{ recorded: boolean; viewsCount: number }> => {
    const response = await api.post(`/stories/${storyId}/view`);
    return response.data;
  },

  getViewers: async (storyId: string): Promise<StoryViewer[]> => {
    const response = await api.get(`/stories/${storyId}/viewers`);
    return response.data;
  },

  deleteStory: async (storyId: string): Promise<void> => {
    await api.delete(`/stories/${storyId}`);
  }
};
