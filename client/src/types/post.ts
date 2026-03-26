import type { Timestamp } from "firebase/firestore";

export interface PostType {
  id: string;
  userId: string;
  title: string;
  username: string | null;
  description: string;
  imageUrl?: string;
  createdAt?: Timestamp;
  hashtags?: string[];
  mentions?: string[];
  isRepost?: boolean;
  originalPostId?: string | {
    _id: string;
    userId: string;
    username: string;
    title: string;
    description: string;
    imageUrl?: string;
  };
  repostCount?: number;
}

export interface Like {
  likeId: string;
  userId: string;
}
