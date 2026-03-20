import React from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { usePosts } from "../../hooks/usePosts";
import { PostCard } from "../../components/PostCard";
import { PostSkeleton } from "../../components/SkeletonLoader";

export const Main = () => {
  const { user, profileLoading } = useAuthContext();
  const userId = user?._id || user?.uid;
  const { posts, loading, loadingMore, hasMore, loadMore } = usePosts(userId, 10);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading || loadingMore || profileLoading);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Feed</h1>
          <p className="mt-1 text-sm text-slate-600">Infinite scroll + realtime updates</p>
        </div>
      </div>

      {loading && posts.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : null}

      {!loading && posts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          No posts yet. Follow people and start sharing.
        </div>
      ) : null}

      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.id || p._id} post={p} />
        ))}
      </div>

      {loadingMore ? (
        <div className="mt-4 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : null}

      <div ref={sentinelRef} className="h-10" />

      {!hasMore && posts.length > 0 && !loading ? (
        <div className="py-6 text-center text-sm text-slate-500">You reached the end</div>
      ) : null}
    </div>
  );
};

