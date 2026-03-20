import { useCallback, useEffect, useState } from "react";
import { getPosts } from "../services/posts.service";
import type { Post } from "../types";

export const usePosts = (userId?: string, pageSize: number = 10) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getPosts(userId, pageSize);
        const postsWithId = data.map((p: any) => ({ ...p, id: p._id }));
        setPosts(postsWithId);
        setHasMore(data.length === pageSize);
        if (data.length > 0) {
          setCursor(data[data.length - 1]._id);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId, pageSize]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore || !cursor) return;

    try {
      setLoadingMore(true);
      const data = await getPosts(userId, pageSize, cursor);
      const postsWithId = data.map((p: any) => ({ ...p, id: p._id }));
      setPosts(prev => [...prev, ...postsWithId]);
      setHasMore(data.length === pageSize);
      if (data.length > 0) {
        setCursor(data[data.length - 1]._id);
      }
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, hasMore, loading, loadingMore, pageSize, userId]);

  return { posts, loading, loadingMore, hasMore, loadMore };
};
