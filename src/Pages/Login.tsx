import React, { useState } from 'react';
import { auth, db, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { AppError, FirebaseAuthError } from '../types/errors';

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    if (loading) return; // prevent multiple popups
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      if (u?.uid) {
        const userDoc = doc(db, 'users', u.uid);
        await setDoc(userDoc, {
          uid: u.uid,
          displayName: u.displayName || null,
          photoURL: u.photoURL || null,
          email: u.email || null,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        }, { merge: true });
      }
      navigate('/');
    } catch (error: unknown) {
      const appError = error as AppError;
      if ((appError as FirebaseAuthError)?.code === 'auth/cancelled-popup-request') {
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
    <div className="login-container" style={{
      maxWidth: '800px',
      minHeight: '80vh',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '2rem',
    }}>
      <div className="login-image" style={{
        flex: '1',
        maxWidth: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <img 
          src={require('../assets/mandem.png')} 
          alt="Login" 
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        />
      </div>
      <div className="login-card" style={{
        flex: '1',
        maxWidth: '400px',
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