import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { login, register, loginWithGoogle } from "../services/auth.service";
import { useToast } from "../components/Toast";
import { useAuthContext } from "../context/AuthContext";
import loginImage from "../assets/mandem.png";

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

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const userData = await loginWithGoogle();
      setUser(userData);
      setProfile(userData);
      addToast("Welcome to ACE VERSE");
      navigate("/");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      addToast(error.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cyber-black px-4 py-12">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-violet/20 via-cyber-black to-cyber-black" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzhjNWZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-6xl"
      >
        <div className="cyber-card overflow-hidden">
          <div className="grid gap-0 md:grid-cols-2">
            {/* Left side - Branding */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative hidden overflow-hidden bg-gradient-to-br from-neon-violet/20 via-neon-indigo/20 to-neon-cyan/20 p-12 backdrop-blur-xl md:block"
            >
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-violet/30 via-transparent to-neon-cyan/30 opacity-50" />
              <motion.div
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(139,92,246,0.1),transparent_50%)] bg-[length:200%_200%]"
              />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <motion.div
                    animate={{ rotate: [0, 5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="mb-6 inline-flex items-center gap-3 rounded-2xl border border-neon-violet/30 bg-white/5 px-6 py-3 backdrop-blur-sm"
                  >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon-violet to-neon-indigo p-2">
                      <svg className="h-full w-full text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-2xl font-black text-white">ACE VERSE</span>
                  </motion.div>

                  <h2 className="mb-4 text-4xl font-black leading-tight text-white">
                    Welcome to the<br />
                    <span className="bg-gradient-to-r from-neon-cyan via-neon-indigo to-neon-violet bg-clip-text text-transparent">
                      Future of Social
                    </span>
                  </h2>
                  <p className="text-lg leading-relaxed text-slate-300">
                    Join our cyberpunk community and share your stories in a whole new dimension.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: "⚡", text: "Lightning-fast posts" },
                    { icon: "🌐", text: "Global community" },
                    { icon: "🔮", text: "Futuristic experience" },
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="flex items-center gap-3 text-slate-200"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                        <span className="text-lg">{feature.icon}</span>
                      </div>
                      <span className="font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Background image overlay */}
              <div className="absolute inset-0 opacity-5">
                <img src={loginImage} alt="Background" className="h-full w-full object-cover" />
              </div>
            </motion.div>

            {/* Right side - Form */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="glass relative border-l border-white/10 bg-cyber-dark/60 p-8 backdrop-blur-xl sm:p-12"
            >
              <div className="mb-8">
                <motion.h1
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-2 bg-gradient-to-r from-neon-cyan via-neon-indigo to-neon-violet bg-clip-text text-3xl font-black text-transparent sm:text-4xl"
                >
                  {isRegister ? "Initialize Account" : "Access System"}
                </motion.h1>
                <motion.p
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-400"
                >
                  {isRegister ? "Create your digital identity" : "Enter your credentials"}
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {isRegister && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-neon-cyan">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="Choose your handle"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none backdrop-blur-sm transition-all focus:border-neon-indigo/50 focus:bg-white/10 focus:ring-2 focus:ring-neon-indigo/20"
                    />
                  </motion.div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-neon-cyan">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none backdrop-blur-sm transition-all focus:border-neon-indigo/50 focus:bg-white/10 focus:ring-2 focus:ring-neon-indigo/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-neon-cyan">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none backdrop-blur-sm transition-all focus:border-neon-indigo/50 focus:bg-white/10 focus:ring-2 focus:ring-neon-indigo/20"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-neon-indigo via-neon-violet to-neon-cyan py-4 font-black text-white shadow-glow-lg shadow-neon-indigo/50 transition-all hover:shadow-glow-xl disabled:opacity-40 disabled:shadow-none"
                >
                  <motion.div
                    animate={{
                      x: loading ? ["-100%", "100%"] : "0%",
                    }}
                    transition={{
                      duration: 1,
                      repeat: loading ? Infinity : 0,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <span className="relative">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : isRegister ? (
                      "Initialize Account"
                    ) : (
                      "Access System"
                    )}
                  </span>
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Or continue with</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                {/* Google Sign-In Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 py-4 font-bold text-slate-100 backdrop-blur-sm transition-all hover:bg-white/10 hover:shadow-glow-md hover:shadow-white/20 disabled:opacity-40"
                >
                  <span className="relative flex items-center justify-center gap-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </span>
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="font-semibold text-neon-cyan transition-colors hover:text-neon-indigo"
                >
                  {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
                </button>
              </div>

              {/* Decorative elements */}
              <div className="absolute bottom-0 right-0 h-32 w-32 bg-gradient-to-tl from-neon-violet/20 to-transparent blur-3xl" />
              <div className="absolute left-0 top-0 h-32 w-32 bg-gradient-to-br from-neon-cyan/20 to-transparent blur-3xl" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};