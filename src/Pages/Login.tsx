import React, { useState } from 'react';
import { auth, provider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    if (loading) return; // prevent multiple popups
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error: any) {
      if (error?.code === 'auth/cancelled-popup-request') {
        console.warn('Sign-in popup cancelled or another popup in progress.');
      } else {
        console.error('Sign-in error:', error);
        alert('Sign-in failed. Check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p>Sign In With Google To Continue</p>
      <button onClick={signInWithGoogle} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In With Google'}
      </button>
    </div>
  );
};