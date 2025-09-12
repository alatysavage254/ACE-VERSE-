export interface PostType {
  id: string;
  userId: string;
  title: string;
  username: string | null;
  description: string;
  imageUrl?: string;
  createdAt?: any; // Consider using FirebaseTimestamp type
}

export interface Like {
  likeId: string;
  userId: string;
}
