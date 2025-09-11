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