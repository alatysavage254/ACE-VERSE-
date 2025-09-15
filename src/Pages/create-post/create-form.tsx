import {useForm} from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from '../../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { Loader } from '../../components/Loader';
import { AppError } from '../../types/errors';
import '../../styles/create-form.css';
import defaultImageSrc from '../../assets/wis.png';

interface CreateFormData {
  title: string;
  description: string;
}
export const CreateForm = () => {
  const [user, authLoading] = useAuthState(auth);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = yup.object().shape({
      title: yup.string().required("You must add a title."),
      description: yup.string().required("you must add a description"),
  });

  const { register,handleSubmit, formState: {errors} } = useForm<CreateFormData>({
    resolver: yupResolver(schema)
  })

  const postRef = collection (db, "posts");

  const onCreatePost = async (data: CreateFormData) => {
    setSubmitError(null);
    if (authLoading) {
      // wait till auth resolves
      return;
    }
    if (!user) {
      setSubmitError('You must be signed in to create a post.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(postRef, {
        ...data,
        username: user.displayName || null,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      navigate('/');
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
    <div className="create-form-container">
      <div className="form-image-section">
        <img 
          src={defaultImageSrc} 
          alt="Create Post" 
          className="form-image"
        />
        <h2 className="form-title">Share Your Story</h2>
      </div>

      <form onSubmit={handleSubmit(onCreatePost)} className="form-section">
        {!user && (
          <div style={{
            backgroundColor: '#fee2e2',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: '#dc2626' }}>You must be signed in to create posts.</span>
            <button 
              type="button" 
              onClick={() => navigate('/login')}
              className="btn btn-primary"
            >
              Sign in
            </button>
          </div>
        )}

        <div className="form-group">
          <input 
            className="form-control"
            placeholder="Enter your title..."
            {...register("title")} 
            disabled={submitting || !user}
          />
          {errors.title?.message && (
            <p className="error-message">{errors.title.message}</p>
          )}
        </div>

        <div className="form-group">
          <textarea 
            className="form-control"
            placeholder="What's on your mind?"
            rows={6}
            {...register("description")} 
            disabled={submitting || !user}
          />
          {errors.description?.message && (
            <p className="error-message">{errors.description.message}</p>
          )}
        </div>

        {submitError && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            {submitError}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={submitting || !user}
        >
          {submitting ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  )

}
