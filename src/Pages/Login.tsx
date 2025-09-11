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
    <div className="container" style={{
      maxWidth: '400px',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="card" style={{
        width: '100%',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '1.5rem'
        }}>
          Welcome Back
        </h1>
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          Sign in with Google to start posting
        </p>
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto',
            padding: '0.75rem 1.5rem'
          }}
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google"
            style={{ width: '20px', height: '20px' }}
          />
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
};