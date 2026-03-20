import React from "react";
import { Link } from "react-router-dom";
import { logout } from "../services/auth.service";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const { user, profile, setUser, setProfile } = useAuthContext();
  const navigate = useNavigate();
  const [theme, setTheme] = React.useState<string>(() => localStorage.getItem("theme") || "light");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const signUserOut = async () => {
    logout();
    setUser(null);
    setProfile(null);
    navigate("/login");
  };

  const displayName = profile?.username || user?.username || "User";
  const photoUrl = profile?.photoURL || user?.photoURL || "";
  const userId = user?._id || user?.uid || "";

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-700 to-cyan-500 text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="font-bold tracking-wide">
          <span className="text-lg sm:text-xl">ACE VERSE</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-4 sm:flex">
            <Link to="/" className="hover:opacity-90">
              Home
            </Link>
            {!user ? (
              <Link to="/login" className="hover:opacity-90">
                Login
              </Link>
            ) : (
              <Link to="/createpost" className="hover:opacity-90">
                Create Post
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden items-center gap-3 sm:flex">
                  <Link to={`/profile/${userId}`} className="flex items-center gap-3">
                    <img src={photoUrl} width={36} height={36} alt="Profile" className="h-9 w-9 rounded-full border border-white/70 object-cover" />
                    <span className="text-sm font-medium">{displayName}</span>
                  </Link>
                </div>
                <button onClick={signUserOut} className="rounded-md bg-white/10 px-3 py-1 text-sm hover:bg-white/20">
                  Log Out
                </button>
              </>
            ) : null}

            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-md bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
              aria-label="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
