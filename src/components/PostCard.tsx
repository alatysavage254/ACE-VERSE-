import React, { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import type { Post } from "../../types";
import { useComments } from "../../hooks/useComments";
import { useLikes } from "../../hooks/useLikes";
import { useToast } from "./Toast";
import { deletePostWithRelations } from "../../services/posts.service";

export const PostCard = ({ post }: { post: Post }) => {
  const { user, profile } = useAuthContext();
  const { addToast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const userId = user?._id || user?.uid;
  const { likes, isLiked, toggleLike, loading: likeLoading } = useLikes(post._id || post.id, userId);
  const { comments, addNewComment, loading: commentSubmitting } = useComments(post._id || post.id);

  const canDelete = userId === post.userId;
  const displayCommentUsername = profile?.username || user?.username || "User";

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
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-700">@{post.username}</div>
              <div className="truncate text-xs text-slate-500">{createdAtLabel}</div>
            </div>
          </div>

          <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-900">{post.title}</h3>
          <p className="mt-2 text-sm text-slate-700">{post.description}</p>

          {post.imageUrl ? (
            <img src={post.imageUrl} alt={post.title} className="mt-3 w-full rounded-lg object-cover" />
          ) : null}
        </div>

        {canDelete ? (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => toggleLike()}
          disabled={!user || likeLoading}
          className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 disabled:opacity-60"
        >
          <span className="text-lg">{isLiked ? "❤️" : "🤍"}</span>
          <span>{likes?.length ?? 0}</span>
        </button>
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold text-slate-900">Comments</div>

        <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
          {comments && comments.length === 0 ? (
            <div className="text-sm text-slate-500">No comments yet.</div>
          ) : null}
          {comments?.map((c) => (
            <div key={c.id || c._id} className="rounded-lg bg-slate-50 p-2">
              <div className="text-xs font-medium text-slate-500">@{c.username}</div>
              <div className="mt-1 text-sm text-slate-800">{c.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={submitComment} className="mt-3 flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={user ? "Write a comment..." : "Sign in to comment"}
            disabled={!user || commentSubmitting}
            className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={!user || !commentText.trim() || commentSubmitting}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {commentSubmitting ? "Posting..." : "Comment"}
          </button>
        </form>
      </div>
    </div>
  );
};