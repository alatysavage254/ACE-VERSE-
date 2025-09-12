import { Link } from "react-router-dom";
import { auth } from '../config/firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from 'firebase/auth';
import "../App.css"
import React, { useEffect, useState } from 'react';
export const Navbar = () => {
const [user] = useAuthState(auth);
const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');

useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}, [theme]);

const signUserOut = async () =>  {
  await signOut(auth);

}
  return (
    <div className="navbar">
      <div className="brand">
        <h1 className="wizard-title">ACE VERSE</h1>
      </div>
      <div className="nav-content">
        <div className="links">
          <Link to="/" className="nav-link">
            <span>Home</span>
          </Link>
          {!user ? (
            <Link to="/login" className="nav-link">
              <span>Login</span>
            </Link>
          ) : (
            <Link to="/createpost" className="nav-link">
              <span>Create Post</span>
            </Link>
          )}
        </div>
        
        <div className="user">
          {user && (
            <>
              <div className="user-info">
                <p className="user-name">{user?.displayName}</p>
                <Link to={`/profile/${user.uid}`} className="profile-link">
                  <img src={user?.photoURL || ""} width="40" height="40" alt="Profile" className="profile-img" />
                </Link>
              </div>
              <button onClick={signUserOut} className="nav-button logout-btn">Log Out</button>
            </>
          )}
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className={`nav-button theme-btn ${theme}`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </div>
  );
};
