import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
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
  const { user: currentUser, profile: currentProfile, profileLoading, setProfile } = useAuthContext();
  const { addToast } = useToast();

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
      addToast("Profile updated");
    } catch (e) {
      console.error(e);
      addToast("Failed to update profile");
    }
  };

  if (profileLoading && !targetUser) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">User not found</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={targetUser.photoURL || ""}
            alt={targetUser.username}
            className="h-20 w-20 rounded-full bg-slate-100 object-cover"
          />
          <div>
            <div className="text-xl font-semibold text-slate-900">{targetUser.username}</div>
            <div className="mt-1 text-sm text-slate-600">{targetUser.bio || ""}</div>
            <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
              <span>
                <span className="font-semibold text-slate-900">{targetUser.followersCount}</span> Followers
              </span>
              <span>
                <span className="font-semibold text-slate-900">{targetUser.followingCount}</span> Following
              </span>
            </div>
          </div>
        </div>

        {!isOwner ? (
          <button
            onClick={toggleFollow}
            disabled={followLoading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {following ? "Unfollow" : "Follow"}
          </button>
        ) : null}
      </div>

      {isOwner ? (
        <form onSubmit={handleSubmit(onSave)} className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
              <input
                {...register("username")}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {formState.errors.username ? (
                <div className="mt-1 text-xs text-red-600">{formState.errors.username.message}</div>
              ) : null}
            </div>
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">Profile image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setValue("imageFile", e.target.files as any)}
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
              <textarea
                {...register("bio")}
                rows={4}
                className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {formState.errors.bio ? <div className="mt-1 text-xs text-red-600">{formState.errors.bio.message}</div> : null}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!formState.isValid || profileLoading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Posts</h2>
        {postsLoading ? (
          <div className="mt-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : null}

        {!postsLoading && posts.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600">No posts yet</div>
        ) : null}

        <div className="mt-4 space-y-4">
          {posts.map((p) => (
            <PostCard key={p.id || p._id} post={p} />
          ))}
        </div>
      </div>
    </div>
  );
};
