import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../context/AuthContext";
import type { Post } from "../types";
import { useComments } from "../hooks/useComments";
import { useLikes } from "../hooks/useLikes";
import { useToast } from "./Toast";
import { deletePostWithRelations } from "../services/posts.service";

export const PostCard = ({ post, priority = false }: { post: Post; priority?: boolean }) => {
  const { user, profile } = useAuthContext();
  const { addToast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const cardRef = useRef<HTMLDivElement>(null);

  const userId = user?._id || user?.uid;
  const { likes, isLiked, toggleLike, loading: likeLoading } = useLikes(post._id || post.id, userId);
  const { comments, addNewComment, loading: commentSubmitting } = useComments(post._id || post.id);

  const canDelete = userId === post.userId || user?.isAdmin;
  const displayCommentUsername = profile?.username || user?.username || "User";

  const images = post.imageUrl ? [post.imageUrl] : [];

  useEffect(() => {
    if (!priority) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
            }
          });
        },
        { rootMargin: "50px" }
      );

      if (cardRef.current) {
        observer.observe(cardRef.current);
      }

      return () => {
        if (cardRef.current) {
          observer.unobserve(cardRef.current);
        }
      };
    }
  }, [priority]);

  useEffect(() => {
    if (images.length > 0 && isInView) {
      const img = new Image();
      img.src = images[currentImageIndex];
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
    }
  }, [images, currentImageIndex, isInView]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDelete = async () => {
    if (!user || !canDelete || deleting) return;
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setDeleting(true);
    try {
      await deletePostWithRelations(post._id || post.id);
      addToast("Post deleted");
    } catch (e) {
      console.error(e);
      addToast("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const trimmed = commentText.trim();
    if (!trimmed) return;

    try {
      await addNewComment(userId!, displayCommentUsername, trimmed);
      setCommentText("");
    } catch (err) {
      console.error(err);
      addToast("Failed to add comment");
    }
  };

  const createdAtLabel = (() => {
    try {
      const date = new Date(post.createdAt);
      return date.toLocaleString();
    } catch {
      return "";
    }
  })();

  return (
    <>
      {/* Instagram-style Feed Card */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="cyber-card group relative overflow-hidden"
      >
        {/* Neon border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-violet/20 via-neon-indigo/20 to-neon-cyan/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="relative glass rounded-2xl border border-white/10 bg-cyber-dark/40 backdrop-blur-xl overflow-hidden">
          {/* Header - User Info */}
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-neon-violet/50 bg-cyber-black">
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-neon-cyan">
                  {post.username?.[0]?.toUpperCase() || "?"}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-100">@{post.username}</div>
                <div className="text-xs text-slate-400">{createdAtLabel}</div>
              </div>
            </div>

            {canDelete && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 backdrop-blur-sm transition-all hover:from-red-500/30 hover:to-pink-500/30 disabled:opacity-40"
              >
                {deleting ? "..." : "Delete"}
              </motion.button>
            )}
          </div>

          {/* Image Carousel */}
          {images.length > 0 && (
            <div className="relative w-full overflow-hidden bg-cyber-black" style={{ maxHeight: '600px', aspectRatio: '1/1' }}>
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-cyber-dark/80 to-cyber-black">
                  <div className="flex h-full items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-neon-indigo/30 border-t-neon-indigo"></div>
                  </div>
                </div>
              )}
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                animate={{ 
                  opacity: imageLoaded ? 1 : 0,
                  scale: imageLoaded ? 1 : 1.05,
                  filter: imageLoaded ? "blur(0px)" : "blur(10px)"
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                src={images[currentImageIndex]}
                alt={post.title}
                loading={priority ? "eager" : "lazy"}
                className="h-full w-full object-contain"
                style={{ willChange: "opacity, transform, filter" }}
              />
              
              {/* Carousel Controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-cyber-black/60 p-2 text-white backdrop-blur-sm transition-all hover:bg-cyber-black/80 hover:scale-110"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-cyber-black/60 p-2 text-white backdrop-blur-sm transition-all hover:bg-cyber-black/80 hover:scale-110"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Dots indicator */}
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${
                          idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Actions Bar */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-4">
              {/* Like button */}
              <button
                onClick={toggleLike}
                disabled={!user || likeLoading}
                className={`flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-40 ${
                  isLiked ? "text-neon-pink" : "text-slate-300 hover:text-slate-100"
                }`}
              >
                <motion.svg
                  animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className="h-7 w-7"
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </motion.svg>
              </button>

              {/* Comment button - opens modal */}
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-300 transition-all hover:text-slate-100"
              >
                <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
            </div>

            {/* Like count */}
            <div className="mt-2">
              <span className="text-sm font-semibold text-slate-100">
                {likes?.length ?? 0} {likes?.length === 1 ? 'like' : 'likes'}
              </span>
            </div>

            {/* Post caption */}
            <div className="mt-2">
              <span className="text-sm font-semibold text-slate-100">@{post.username}</span>
              <span className="ml-2 text-sm text-slate-300">{post.title}</span>
              {post.description && (
                <p className="mt-1 text-sm text-slate-300">{post.description}</p>
              )}
            </div>

            {/* View comments button */}
            {comments && comments.length > 0 && (
              <button
                onClick={() => setIsOpen(true)}
                className="mt-2 text-sm text-slate-400 transition-colors hover:text-slate-300"
              >
                View all {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Comments Modal - Instagram Style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black/95 backdrop-blur-sm p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative flex h-[90vh] w-full max-w-7xl overflow-hidden rounded-2xl bg-cyber-black"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left: Image */}
              <div className="relative flex flex-1 items-center justify-center bg-cyber-black">
                {images.length > 0 ? (
                  <>
                    <motion.img
                      key={currentImageIndex}
                      initial={{ opacity: 0, filter: "blur(10px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.3 }}
                      src={images[currentImageIndex]}
                      alt={post.title}
                      loading="eager"
                      className="max-h-full max-w-full object-contain"
                      style={{ willChange: "opacity, filter" }}
                    />
                      
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-cyber-black/80 p-3 text-white backdrop-blur-sm transition-all hover:bg-cyber-black hover:scale-110 z-10"
                        >
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-cyber-black/80 p-3 text-white backdrop-blur-sm transition-all hover:bg-cyber-black hover:scale-110 z-10"
                        >
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        
                        {/* Dots indicator */}
                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 z-10">
                          {images.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-1.5 w-1.5 rounded-full transition-all ${
                                idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-slate-500">No image</span>
                  </div>
                )}
              </div>

              {/* Right: Comments Section */}
              <div className="glass flex w-full max-w-md flex-col border-l border-white/10 bg-cyber-dark/60 backdrop-blur-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-neon-violet/50 bg-cyber-black">
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-neon-cyan">
                        {post.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-100">@{post.username}</div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg bg-white/5 p-2 text-slate-300 transition-all hover:bg-white/10"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {/* Original Post Caption as First Comment */}
                  <div className="mb-6 flex gap-3">
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border-2 border-neon-violet/50 bg-cyber-black">
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neon-cyan">
                        {post.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-slate-100">@{post.username}</span>
                        <span className="text-xs text-slate-500">{createdAtLabel}</span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">
                        <span className="font-semibold">{post.title}</span>
                        {post.description && <span className="ml-1">{post.description}</span>}
                      </p>
                    </div>
                  </div>

                  {/* User Comments */}
                  {comments && comments.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500">No comments yet. Be the first!</div>
                  ) : (
                    <div className="space-y-4">
                      {comments?.map((c, idx) => (
                        <motion.div
                          key={c.id || c._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex gap-3"
                        >
                          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-neon-violet/50 to-neon-indigo/50" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-semibold text-slate-100">@{c.username}</span>
                              <span className="text-xs text-slate-500">now</span>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-slate-300">{c.text}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions & Comment Input */}
                <div className="border-t border-white/10">
                  {/* Like/Comment Actions */}
                  <div className="flex items-center gap-4 border-b border-white/10 p-4">
                    <button
                      onClick={toggleLike}
                      disabled={!user || likeLoading}
                      className={`flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-40 ${
                        isLiked ? "text-neon-pink" : "text-slate-300 hover:text-slate-100"
                      }`}
                    >
                      <motion.svg
                        animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.3 }}
                        className="h-7 w-7"
                        fill={isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </motion.svg>
                    </button>
                  </div>

                  {/* Like Count */}
                  <div className="border-b border-white/10 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-100">
                      {likes?.length ?? 0} {likes?.length === 1 ? 'like' : 'likes'}
                    </span>
                  </div>

                  {/* Comment Input */}
                  <div className="p-4">
                    <form onSubmit={submitComment} className="flex gap-2">
                      <input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={user ? "Add a comment..." : "Sign in to comment"}
                        disabled={!user || commentSubmitting}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none backdrop-blur-sm transition-all focus:border-neon-indigo/50 focus:bg-white/10 focus:ring-2 focus:ring-neon-indigo/20 disabled:opacity-40"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!user || !commentText.trim() || commentSubmitting}
                        className="rounded-xl bg-gradient-to-r from-neon-indigo to-neon-cyan px-5 py-2.5 text-sm font-bold text-white shadow-glow-md shadow-neon-indigo/50 transition-all hover:shadow-glow-lg disabled:opacity-40 disabled:shadow-none"
                      >
                        {commentSubmitting ? "..." : "Post"}
                      </motion.button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};