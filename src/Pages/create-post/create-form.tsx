import {useForm} from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from '../../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

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
      });
      navigate('/');
    } catch (error: any) {
      console.error('Failed to create post', error);
      setSubmitError(error?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <p>Checking authentication...</p>;

  return (
    <form onSubmit={handleSubmit(onCreatePost)}>
      {!user && (
        <div style={{color: 'red'}}>You must be signed in to create posts. <button type="button" onClick={() => navigate('/login')}>Sign in</button></div>
      )}

      <input placeholder='Title...' {...register("title")} disabled={submitting || !user}/>
      <p style={{color: "red"}}> {errors.title?.message}</p>
      <textarea placeholder='Description...' {...register("description")} disabled={submitting || !user}/>
      <p style={{color: "red"}}> {errors.description?.message}</p>
      {submitError && <p style={{color: 'red'}}>{submitError}</p>}
      <input type="submit" value={submitting ? 'Creating...' : 'Create Post'} disabled={submitting || !user} />
    </form>
  )
}