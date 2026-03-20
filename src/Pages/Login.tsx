import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/auth.service";
import { useToast } from "../components/Toast";
import { useAuthContext } from "../context/AuthContext";

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { addToast } = useToast();
  const { setUser, setProfile } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    
    try {
      let userData;
      if (isRegister) {
        userData = await register(email, password, username);
        addToast("Account created successfully");
      } else {
        userData = await login(email, password);
        addToast("Welcome back");
      }
      setUser(userData);
      setProfile(userData);
      navigate("/");
    } catch (error: any) {
      console.error("Auth error:", error);
      addToast(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-between gap-8 px-4 py-8">
      <div className="hidden flex-1 items-center justify-center md:flex">
        <img 
          src={require('../assets/mandem.png')} 
          alt="Login" 
          className="h-auto max-w-full rounded-2xl shadow-2xl"
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        <h1 className="mb-4 text-3xl font-semibold text-slate-900">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="mb-8 text-slate-600">
          {isRegister ? "Sign up to start posting" : "Sign in to continue"}
        </p>
        
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Please wait...' : (isRegister ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="mt-4 text-sm text-indigo-600 hover:underline"
        >
          {isRegister ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
};