export interface User {
  _id: string;
  email: string;
  username: string;
  bio: string;
  photoURL: string;
  followersCount: number;
  followingCount: number;
  isAdmin?: boolean;
  uid?: string;
  displayName?: string;
}

export interface Post {
  _id: string;
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date | string;
}

export interface Like {
  _id: string;
  id: string;
  postId: string;
  userId: string;
}

export interface Comment {
  _id: string;
  id: string;
  postId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date | string;
}

export interface Follow {
  _id: string;
  followerId: string;
  followingId: string;
}
