import React, { useState } from 'react';
import { auth, provider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Successfully signed in:", result.user.displayName);
      navigate('/');
    } catch (error: any) {
      console.error('Sign-in error:', error);
      
      // Handle specific error cases
      const errorMessage = error.code === 'auth/popup-closed-by-user'
        ? 'Sign-in cancelled. Please try again.'
        : error.code === 'auth/popup-blocked'
        ? 'Pop-up was blocked by your browser. Please allow pop-ups for this site.'
        : 'Failed to sign in. Please try again.';
      
      alert(errorMessage);
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