import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import type { Post, User } from "../../types";
import { useAuthContext } from "../../context/AuthContext";
import { useFollow } from "../../hooks/useFollow";
import { ProfileSkeleton } from "../../components/SkeletonLoader";
import { useToast } from "../../components/Toast";
import { uploadProfileImage, updateUserProfile, getUserProfile } from "../../services/users.service";
import { getUserPosts as getPostsByUser } from "../../services/posts.service";
import { PostCard } from "../../components/PostCard";

type ProfileForm = { username: string; bio: string; imageFile?: FileList };

export const Profile = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, profile: currentProfile, profileLoading, setProfile } = useAuthContext();
  const { addToast } = useToast();
  const [editMode, setEditMode] = useState(false);

  const targetUid = uid || "";
  const currentUserId = currentUser?._id || currentUser?.uid;
  const isOwner = !!currentUser && currentUserId === targetUid;

  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  const { following, toggleFollow, loading: followLoading } = useFollow(currentUserId, targetUid);

  const schema = useMemo(
    () =>
      yup.object().shape({
        username: yup.string().trim().min(2).max(30).required("Username is required"),
        bio: yup.string().trim().max(160).required("Bio is required"),
      }),
    []
  );

  const { register, handleSubmit, formState, reset, setValue } = useForm<ProfileForm>({
    resolver: yupResolver(schema),
    defaultValues: { username: "", bio: "", imageFile: undefined },
  });

  useEffect(() => {
    if (!targetUid) return;
    
    const fetchUser = async () => {
      try {
        const userData = await getUserProfile(targetUid);
        setTargetUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [targetUid]);

  useEffect(() => {
    if (!targetUid) return;
    setPostsLoading(true);
    (async () => {
      try {
        const data = await getPostsByUser(targetUid);
        const postsWithId = data.map((p: any) => ({ ...p, id: p._id }));
        setPosts(postsWithId);
      } catch (e) {
        console.error(e);
      } finally {
        setPostsLoading(false);
      }
    })();
  }, [targetUid]);

  useEffect(() => {
    if (!isOwner) return;
    if (!currentProfile) return;
    reset({ username: currentProfile.username, bio: currentProfile.bio, imageFile: undefined });
  }, [isOwner, currentProfile, reset]);

  const onSave = async (values: ProfileForm) => {
    if (!currentUser || !isOwner) return;
    try {
      const username = values.username.trim();
      const bio = values.bio.trim();

      let photoURL = currentProfile?.photoURL || null;
      const file = values.imageFile?.[0];
      if (file) photoURL = await uploadProfileImage(currentUserId!, file);

      const updated = await updateUserProfile(currentUserId!, { username, bio, photoURL });
      setProfile(updated);
      setEditMode(false);
      addToast("Profile updated");
    } catch (e) {
      console.error(e);
      addToast("Failed to update profile");
    }
  };

  if (profileLoading && !targetUser) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="cyber-card glass rounded-xl border border-white/10 bg-cyber-dark/40 p-6 text-center text-slate-400 backdrop-blur-xl">
          User not found
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card group relative overflow-hidden"
      >
        {/* Neon glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-violet/20 via-neon-indigo/20 to-neon-cyan/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

        <div className="glass relative rounded-2xl border border-white/10 bg-cyber-dark/40 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Avatar and Info */}
            <div className="flex items-center gap-5">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-violet to-neon-cyan opacity-75 blur-lg" />
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-neon-violet/50 bg-cyber-black">
                  {targetUser.photoURL ? (
                    <img
                      src={targetUser.photoURL}
                      alt={targetUser.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-black text-neon-cyan">
                      {targetUser.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
              </motion.div>

              <div>
                <h1 className="bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-2xl font-black text-transparent">
                  {targetUser.username}
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{targetUser.bio || "No bio yet"}</p>

                {/* Stats */}
                <div className="mt-4 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-neon-cyan">{targetUser.followersCount || 0}</span>
                    <span className="text-slate-400">Followers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-neon-indigo">{targetUser.followingCount || 0}</span>
                    <span className="text-slate-400">Following</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isOwner ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleFollow}
                    disabled={followLoading}
                    className={`rounded-xl px-6 py-3 text-sm font-bold backdrop-blur-sm transition-all disabled:opacity-40 ${
                      following
                        ? "bg-white/10 text-slate-300 hover:bg-white/20"
                        : "bg-gradient-to-r from-neon-indigo to-neon-cyan text-white shadow-glow-md shadow-neon-indigo/50 hover:shadow-glow-lg"
                    }`}
                  >
                    {following ? "Unfollow" : "Follow"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/messages', { state: { startConversationWith: targetUser } })}
                    className="rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-slate-300 backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    Message
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode(!editMode)}
                  className="rounded-xl bg-gradient-to-r from-neon-violet/30 to-neon-indigo/30 px-6 py-3 text-sm font-bold text-neon-cyan backdrop-blur-sm transition-all hover:from-neon-violet/40 hover:to-neon-indigo/40"
                >
                  {editMode ? "Cancel" : "Edit Profile"}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Form */}
      <AnimatePresence>
        {isOwner && editMode && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit(onSave)}
            className="mt-5 overflow-hidden"
          >
            <div className="cyber-card glass rounded-2xl border border-white/10 bg-cyber-dark/40 p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-indigo/30 to-transparent" />
                <span className="text-xs font-bold uppercase tracking-wider text-neon-indigo">Edit Profile</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-indigo/30 to-transparent" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-neon-cyan">
                    Username
                  </label>
                  <input
                    {...register("username")}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none backdrop-blur-sm transition-all focus:border-neon-indigo/50 focus:bg-white/10 focus:ring-2 focus:ring-neon-indigo/20"
                  />
                  {formState.errors.username && (
                    <div className="mt-1 text-xs text-red-400">{formState.errors.username.message}</div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-neon-cyan">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setValue("imageFile", e.target.files as any)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-neon-indigo/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-neon-cyan hover:file:bg-neon-indigo/30"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-neon-cyan">Bio</label>
                  <textarea
                    {...register("bio")}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none backdrop-blur-sm transition-all focus:border-neon-indigo/50 focus:bg-white/10 focus:ring-2 focus:ring-neon-indigo/20"
                  />
                  {formState.errors.bio && (
                    <div className="mt-1 text-xs text-red-400">{formState.errors.bio.message}</div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-slate-300 backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!formState.isValid || profileLoading}
                  className="rounded-xl bg-gradient-to-r from-neon-indigo to-neon-cyan px-6 py-3 text-sm font-bold text-white shadow-glow-md shadow-neon-indigo/50 transition-all hover:shadow-glow-lg disabled:opacity-40 disabled:shadow-none"
                >
                  Save Changes
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Posts Section */}
      <div className="mt-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-violet/30 to-transparent" />
          <h2 className="text-lg font-black uppercase tracking-wider text-neon-violet">Posts</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-violet/30 to-transparent" />
        </div>

        {postsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="h-36 animate-pulse rounded-xl bg-white/5 backdrop-blur-sm"
              />
            ))}
          </div>
        ) : null}

        {!postsLoading && posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cyber-card glass rounded-xl border border-white/10 bg-cyber-dark/40 p-12 text-center backdrop-blur-xl"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neon-indigo/20 to-neon-cyan/20">
              <svg className="h-8 w-8 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-400">No posts yet</p>
          </motion.div>
        ) : null}

        <div className="space-y-4">
          {posts.map((p, idx) => (
            <motion.div
              key={p.id || p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <PostCard post={p} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
