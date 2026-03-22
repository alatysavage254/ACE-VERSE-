import { useAuthContext } from "../../context/AuthContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { usePosts } from "../../hooks/usePosts";
import { PostCard } from "../../components/PostCard";
import { PostSkeleton } from "../../components/SkeletonLoader";
import { motion } from "framer-motion";

export const Main = () => {
  const { profileLoading } = useAuthContext();
  // Don't pass userId to show ALL posts, not just followed users
  const { posts, loading, loadingMore, hasMore, loadMore } = usePosts(undefined, 10);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading || loadingMore || profileLoading);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-violet/20 via-cyber-black to-cyber-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-neon-indigo/10 via-transparent to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-3 text-5xl font-black tracking-tighter sm:text-6xl"
          >
            <span className="neon-text">Your Feed</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-sm text-slate-400"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-neon-violet shadow-neon-violet"
            />
            <span className="tracking-wider">LIVE UPDATES</span>
          </motion.div>
        </motion.div>

        {/* Loading State */}
        {loading && posts.length === 0 ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <PostSkeleton />
              </motion.div>
            ))}
          </div>
        ) : null}

        {/* Empty State */}
        {!loading && posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md"
          >
            <div className="cyber-card cyber-card-hover text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6 text-6xl"
              >
                <div className="inline-block rounded-full bg-gradient-to-br from-neon-violet/20 to-neon-indigo/20 p-8">
                  <svg className="h-16 w-16 text-neon-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
              </motion.div>
              <h3 className="mb-2 text-xl font-bold text-slate-100">No posts yet</h3>
              <p className="text-slate-400">Be the first to share something amazing</p>
            </div>
          </motion.div>
        ) : null}

        {/* Posts Grid - Floating Cards */}
        <div className="space-y-6">
          {posts.map((p, index) => (
            <motion.div
              key={p.id || p._id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <PostCard post={p} priority={index < 3} />
            </motion.div>
          ))}
        </div>

        {/* Loading More */}
        {loadingMore ? (
          <div className="mt-6 space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <PostSkeleton />
              </motion.div>
            ))}
          </div>
        ) : null}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-10" />
      </div>
    </div>
  );
};
