import React from "react";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../services/auth.service";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserSearch } from "./UserSearch";
import { NotificationBell } from "./NotificationBell";

export const Navbar = () => {
  const { user, profile, setUser, setProfile } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const signUserOut = async () => {
    logout();
    setUser(null);
    setProfile(null);
    navigate("/login");
  };

  const displayName = profile?.username || user?.username || "User";
  const photoUrl = profile?.photoURL || user?.photoURL || "";
  const userId = user?._id || user?.uid || "";

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-2xl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-violet to-neon-indigo shadow-neon-violet"
            >
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neon-violet to-neon-indigo opacity-50 blur-lg" />
            </motion.div>
            <span className="neon-text text-xl font-black tracking-tighter sm:text-2xl">
              ACE VERSE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex flex-1 justify-center px-8">
            <UserSearch />
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <NavLink to="/" active={isActive("/")}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </NavLink>
            
            {!user ? (
              <NavLink to="/login" active={isActive("/login")}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </NavLink>
            ) : (
              <>
                <NavLink to="/messages" active={isActive("/messages")}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Messages
                </NavLink>
                <NavLink to="/createpost" active={isActive("/createpost")}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create
                </NavLink>
              </>
            )}
          </div>

          {/* User Menu & Actions */}
          <div className="flex items-center gap-3">
            {user && <NotificationBell />}
            
            {user && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={`/profile/${userId}`}
                  className="hidden items-center gap-3 rounded-xl glass-hover px-4 py-2 md:flex"
                >
                  <div className="relative">
                    <img
                      src={photoUrl}
                      alt={displayName}
                      className="h-8 w-8 rounded-full border-2 border-neon-violet object-cover"
                    />
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neon-violet to-neon-indigo opacity-50 blur-sm" />
                  </div>
                  <span className="font-semibold text-slate-100">{displayName}</span>
                </Link>
              </motion.div>
            )}

            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={signUserOut}
                className="hidden rounded-xl glass-hover px-4 py-2 font-medium text-red-400 md:block"
              >
                Logout
              </motion.button>
            )}

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl glass-hover p-2 text-slate-100 md:hidden"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 py-4 md:hidden"
          >
            <div className="flex flex-col gap-2">
              <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </MobileNavLink>
              {user ? (
                <>
                  <MobileNavLink to="/createpost" onClick={() => setMobileMenuOpen(false)}>
                    Create Post
                  </MobileNavLink>
                  <MobileNavLink to={`/profile/${userId}`} onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3">
                      <img src={photoUrl} alt={displayName} className="h-8 w-8 rounded-full border-2 border-neon-violet" />
                      {displayName}
                    </div>
                  </MobileNavLink>
                  <button
                    onClick={() => {
                      signUserOut();
                      setMobileMenuOpen(false);
                    }}
                    className="rounded-xl glass-hover px-4 py-3 text-left font-medium text-red-400"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <MobileNavLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </MobileNavLink>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

const NavLink = ({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all ${
        active
          ? "glass border border-neon-violet/50 text-neon-violet shadow-glow-sm"
          : "text-slate-400 hover:text-slate-100 glass-hover"
      }`}
    >
      {children}
    </motion.div>
  </Link>
);

const MobileNavLink = ({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) => (
  <Link to={to} onClick={onClick}>
    <motion.div
      whileTap={{ scale: 0.95 }}
      className="rounded-xl glass-hover px-4 py-3 font-medium text-slate-100"
    >
      {children}
    </motion.div>
  </Link>
);
