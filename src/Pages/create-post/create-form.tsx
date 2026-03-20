import {useForm} from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
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

  const schema = yup.object().shape({
      title: yup.string().required("You must add a title."),
      description: yup.string().required("you must add a description"),
  });

  const { register,handleSubmit, formState: {errors} } = useForm<CreateFormData>({
    resolver: yupResolver(schema)
  })

  const onCreatePost = async (data: CreateFormData) => {
    setSubmitError(null);
    if (authLoading || !user) {
      return;
    }

    setSubmitting(true);
    try {
      const username = profile?.username || user.displayName || "User";
      await createPost(user.uid, username, data.title, data.description);
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <img
            src={defaultImageSrc}
            alt="Create Post"
            className="mx-auto mb-3 h-16 w-16 rounded-xl shadow-md"
          />
          <h2 className="text-3xl font-bold text-indigo-900">Share Your Story</h2>
        </div>

        <form onSubmit={handleSubmit(onCreatePost)} className="space-y-5">
          {!user && (
            <div className="flex items-center justify-between rounded-lg bg-red-50 p-4">
              <span className="text-red-600">You must be signed in to create posts.</span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-indigo-700"
              >
                Sign in
              </button>
            </div>
          )}

          <div>
            <input
              className="w-full rounded-lg border-2 border-indigo-200 bg-slate-50 px-4 py-3 text-lg font-medium outline-none transition focus:border-indigo-500 disabled:opacity-60"
              placeholder="Enter your title..."
              {...register('title')}
              disabled={submitting || !user}
            />
            {errors.title?.message && (
              <span className="ml-1 mt-1 block text-sm text-red-600">{errors.title.message}</span>
            )}
          </div>

          <div>
            <textarea
              className="w-full resize-vertical rounded-lg border-2 border-indigo-200 bg-slate-50 px-4 py-3 text-lg font-medium outline-none transition focus:border-indigo-500 disabled:opacity-60"
              placeholder="What's on your mind?"
              rows={6}
              {...register('description')}
              disabled={submitting || !user}
            />
            {errors.description?.message && (
              <span className="ml-1 mt-1 block text-sm text-red-600">{errors.description.message}</span>
            )}
          </div>

          {submitError && (
            <div className="rounded-lg bg-red-50 p-3 text-red-600">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 py-3 text-lg font-bold text-white shadow-md transition hover:from-indigo-700 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting || !user}
          >
            {submitting ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  )

}
