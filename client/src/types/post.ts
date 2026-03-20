import type { Timestamp } from "firebase/firestore";

export interface PostType {
  id: string;
  userId: string;
  title: string;
  username: string | null;
  description: string;
  imageUrl?: string;
  createdAt?: Timestamp;
}

export interface Like {
  likeId: string;
  userId: string;
}
