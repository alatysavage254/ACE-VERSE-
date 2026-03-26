import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../services/posts.service';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  _id: string;
  username: string;
  photoURL: string;
  bio: string;
}

export const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        try {
          const users = await searchUsers(query);
          setResults(users);
          setIsOpen(true);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 pl-10 text-sm text-slate-100 placeholder-slate-500 outline-none backdrop-blur-sm transition-all focus:border-neon-indigo/50 focus:bg-white/10 focus:ring-2 focus:ring-neon-indigo/20"
        />
        <svg
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full rounded-xl border border-white/10 bg-cyber-dark/95 backdrop-blur-xl shadow-2xl z-50"
          >
            {loading ? (
              <div className="p-4 text-center text-sm text-slate-400">Searching...</div>
            ) : results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {results.map((user) => (
                  <motion.button
                    key={user._id}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    onClick={() => handleUserClick(user._id)}
                    className="flex w-full items-center gap-3 border-b border-white/5 p-3 text-left transition-colors last:border-b-0"
                  >
                    <img
                      src={user.photoURL}
                      alt={user.username}
                      className="h-10 w-10 rounded-full border-2 border-neon-violet/50 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-100">@{user.username}</div>
                      {user.bio && (
                        <div className="text-xs text-slate-400 truncate">{user.bio}</div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : query.trim().length > 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">No users found</div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
