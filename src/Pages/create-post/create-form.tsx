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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #f0f4f8 0%, #e0e7ff 100%)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 18,
        boxShadow: '0 8px 32px rgba(60, 60, 120, 0.15)',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src={defaultImageSrc}
            alt="Create Post"
            style={{ width: 64, height: 64, borderRadius: 12, marginBottom: 12, boxShadow: '0 2px 8px #e0e7ff' }}
          />
          <h2 style={{ fontWeight: 700, fontSize: '1.7rem', color: '#3730a3', margin: 0 }}>Share Your Story</h2>
        </div>

        <form onSubmit={handleSubmit(onCreatePost)} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {!user && (
            <div style={{
              backgroundColor: '#fee2e2',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '1rem',
            }}>
              <span style={{ color: '#dc2626' }}>You must be signed in to create posts.</span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.5rem 1.2rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #e0e7ff',
                }}
              >
                Sign in
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              style={{
                padding: '0.8rem',
                borderRadius: 8,
                border: '1.5px solid #c7d2fe',
                fontSize: '1.08rem',
                fontWeight: 500,
                background: '#f3f4f6',
                outline: 'none',
                transition: 'border 0.2s',
                marginBottom: 2,
              }}
              placeholder="Enter your title..."
              {...register('title')}
              disabled={submitting || !user}
            />
            {errors.title?.message && (
              <span style={{ color: '#dc2626', fontSize: '0.98rem', marginLeft: 2 }}>{errors.title.message}</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <textarea
              style={{
                padding: '0.8rem',
                borderRadius: 8,
                border: '1.5px solid #c7d2fe',
                fontSize: '1.08rem',
                background: '#f3f4f6',
                outline: 'none',
                minHeight: 120,
                resize: 'vertical',
                fontWeight: 500,
                marginBottom: 2,
              }}
              placeholder="What's on your mind?"
              rows={6}
              {...register('description')}
              disabled={submitting || !user}
            />
            {errors.description?.message && (
              <span style={{ color: '#dc2626', fontSize: '0.98rem', marginLeft: 2 }}>{errors.description.message}</span>
            )}
          </div>

          {submitError && (
            <div style={{ color: '#dc2626', background: '#fee2e2', borderRadius: 8, padding: '0.7rem', fontSize: '1rem', marginBottom: '0.5rem' }}>
              {submitError}
            </div>
          )}

          <button
            type="submit"
            style={{
              background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '0.9rem 0',
              fontWeight: 700,
              fontSize: '1.08rem',
              cursor: submitting || !user ? 'not-allowed' : 'pointer',
              opacity: submitting || !user ? 0.7 : 1,
              boxShadow: '0 2px 8px #e0e7ff',
              marginTop: 4,
              transition: 'background 0.2s',
            }}
            disabled={submitting || !user}
          >
            {submitting ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  )

}
