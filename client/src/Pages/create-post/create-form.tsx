import {useForm} from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from '../../components/Loader';
import { AppError } from '../../types/errors';
import { useToast } from '../../components/Toast';
import { useAuthContext } from '../../context/AuthContext';
import defaultImageSrc from '../../assets/wis.png';
import { createPost } from '../../services/posts.service';

interface CreateFormData {
  title: string;
  description: string;
}
export const CreateForm = () => {
  const { user, profile, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { addToast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const schema = yup.object().shape({
      title: yup.string().required("You must add a title."),
      description: yup.string().required("you must add a description"),
  });

  const { register,handleSubmit, formState: {errors} } = useForm<CreateFormData>({
    resolver: yupResolver(schema)
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast("Image must be less than 10MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        addToast("Please select an image file");
        return;
      }
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxDimension = 1200;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setImagePreview(compressedDataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast("Image must be less than 10MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        addToast("Please select an image file");
        return;
      }
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxDimension = 1200;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setImagePreview(compressedDataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onCreatePost = async (data: CreateFormData) => {
    setSubmitError(null);
    if (authLoading || !user) {
      return;
    }

    setSubmitting(true);
    try {
      const username = profile?.username || user.displayName || "User";
      const imageUrl = imagePreview || "";
      await createPost(user.uid, username, data.title, data.description, imageUrl);
      navigate('/');
      addToast("Post created");
    } catch (error: unknown) {
      const appError = error as AppError;
      console.error('Failed to create post', appError);
      setSubmitError(appError?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <Loader />;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cyber-black px-4 py-12">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-indigo/20 via-cyber-black to-cyber-black" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-3xl"
      >
        <div className="cyber-card overflow-hidden">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-neon-indigo/20 via-neon-violet/20 to-neon-cyan/20 p-8 text-center backdrop-blur-xl">
            <motion.div
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-neon-indigo/30 via-neon-violet/30 to-neon-cyan/30 bg-[length:200%_100%]"
            />
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 5, 0] }}
              transition={{ delay: 0.2, duration: 0.5, rotate: { duration: 3, repeat: Infinity } }}
              className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-neon-cyan/30 bg-gradient-to-br from-neon-indigo/20 to-neon-cyan/20 backdrop-blur-sm"
            >
              <img src={defaultImageSrc} alt="Create Post" className="h-12 w-12 rounded-xl" />
            </motion.div>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative text-3xl font-black text-white sm:text-4xl"
            >
              Create Your Story
            </motion.h2>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative mt-2 text-slate-300"
            >
              Share something amazing with the community
            </motion.p>
          </div>

          {/* Form */}
          <div className="glass border-t border-white/10 bg-cyber-dark/60 p-8 backdrop-blur-xl sm:p-12">
            <form onSubmit={handleSubmit(onCreatePost)} className="space-y-6">
              {!user && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-4 backdrop-blur-sm"
                >
                  <span className="font-semibold text-red-400">Authentication required</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => navigate('/login')}
                    className="rounded-lg bg-gradient-to-r from-red-500 to-pink-500 px-5 py-2 font-bold text-white shadow-glow-md shadow-red-500/50"
                  >
                    Sign in
                  </motion.button>
                </motion.div>
              )}

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-neon-cyan">
                  Title
                </label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-lg font-semibold text-slate-100 placeholder-slate-500 outline-none backdrop-blur-sm transition-all focus:border-neon-indigo/50 focus:bg-white/10 focus:ring-2 focus:ring-neon-indigo/20 disabled:opacity-40"
                  placeholder="Give your post an epic title..."
                  {...register('title')}
                  disabled={submitting || !user}
                />
                <AnimatePresence>
                  {errors.title?.message && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="ml-1 mt-2 block text-sm font-semibold text-red-400"
                    >
                      ⚠ {errors.title.message}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-neon-cyan">
                  Description
                </label>
                <textarea
                  className="w-full resize-vertical rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-lg text-slate-100 placeholder-slate-500 outline-none backdrop-blur-sm transition-all focus:border-neon-indigo/50 focus:bg-white/10 focus:ring-2 focus:ring-neon-indigo/20 disabled:opacity-40"
                  placeholder="What's on your mind? Share your thoughts..."
                  rows={6}
                  {...register('description')}
                  disabled={submitting || !user}
                />
                <AnimatePresence>
                  {errors.description?.message && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="ml-1 mt-2 block text-sm font-semibold text-red-400"
                    >
                      ⚠ {errors.description.message}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Image Upload with magnetic drop zone */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-neon-cyan">
                  Add Image (Optional)
                </label>

                {!imagePreview ? (
                  <motion.div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    animate={{
                      scale: dragActive ? 1.02 : 1,
                      borderColor: dragActive ? "rgba(34, 211, 238, 0.5)" : "rgba(255, 255, 255, 0.1)",
                    }}
                    className={`relative overflow-hidden rounded-xl border-2 border-dashed p-8 text-center backdrop-blur-sm transition-all ${
                      dragActive
                        ? "border-neon-cyan bg-neon-cyan/10 shadow-glow-md shadow-neon-cyan/30"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      disabled={submitting || !user}
                    />
                    
                    <motion.div
                      animate={dragActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: dragActive ? Infinity : 0 }}
                      className="pointer-events-none"
                    >
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neon-indigo/20 to-neon-cyan/20 backdrop-blur-sm">
                        <svg className="h-8 w-8 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="mb-2 text-sm font-semibold text-slate-300">
                        {dragActive ? "Drop it here!" : "Drop your image here, or click to browse"}
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                    </motion.div>

                    {dragActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-neon-indigo/10 via-neon-cyan/10 to-neon-indigo/10"
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto max-h-64 rounded-lg object-contain"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={removeImage}
                      className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 p-2 text-white shadow-glow-lg shadow-red-500/50 transition-all"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                    <p className="mt-3 text-center text-sm text-slate-400">{imageFile?.name}</p>
                  </motion.div>
                )}
              </div>

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 font-semibold text-red-400 backdrop-blur-sm"
                >
                  {submitError}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-neon-indigo via-neon-violet to-neon-cyan py-4 text-lg font-black text-white shadow-glow-lg shadow-neon-indigo/50 transition-all hover:shadow-glow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                disabled={submitting || !user}
              >
                <motion.div
                  animate={{
                    x: submitting ? ["-100%", "100%"] : "0%",
                  }}
                  transition={{
                    duration: 1,
                    repeat: submitting ? Infinity : 0,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <span className="relative">
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Post"
                  )}
                </span>
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 bg-gradient-to-tr from-neon-violet/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 bg-gradient-to-bl from-neon-cyan/10 to-transparent blur-3xl" />
    </div>
  );
};
