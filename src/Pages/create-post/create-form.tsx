import {useForm} from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db, storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { Loader } from '../../components/Loader';
//import { Loader } from '../../components/Loader';

interface CreateFormData {
  title: string;
  description: string;
}
export const CreateForm = () => {

  const [user, authLoading] = useAuthState(auth);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      let imageUrl: string | null = null;

      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const storagePath = `posts/${user.uid}/${Date.now()}_${safeName}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(postRef, {
        ...data,
        username: user.displayName || null,
        userId: user.uid,
        imageUrl,
        createdAt: serverTimestamp(),
      });
      navigate('/');
    } catch (error: any) {
      console.error('Failed to create post', error);
      setSubmitError(error?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <Loader />;

  return (
    <div className="container" style={{ maxWidth: '600px', padding: '2rem 20px' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: '600', 
        color: '#1f2937',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        Create a New Post
      </h1>

      <form onSubmit={handleSubmit(onCreatePost)} className="card">
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

        <div className="form-group">
          <input
            type="file"
            accept="image/*"
            className="form-control"
            disabled={submitting || !user}
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setFile(selected);
              setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
            }}
          />
          {previewUrl && (
            <div style={{ marginTop: '0.5rem' }}>
              <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
            </div>
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
