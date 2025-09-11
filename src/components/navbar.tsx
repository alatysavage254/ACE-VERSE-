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
      <div className="links">
        <Link to="/">Home</Link>
        {!user ? (
          <Link to = "/login"> Login </Link>
        ) : (
        
        <Link to="/createpost">Create Post</Link>
        )}
      </div>
    
    <div className="user">
      {user && (
      <>
     <p> {user?.displayName} </p>
      <Link to={`/profile/${user.uid}`}>
        <img src={user?.photoURL || ""} width="20" height="20" alt="Random" />
      </Link>
      <button onClick={signUserOut}> Log Out</button>
      </>
      )}
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{ marginLeft: 12 }}> {theme === 'light' ? 'Dark' : 'Light'} </button>
    </div>
    </div>
  );
};
