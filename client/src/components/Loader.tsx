import { motion } from 'framer-motion';

export const Loader = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        {/* Neon glow */}
        <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-gradient-to-r from-neon-violet to-neon-cyan opacity-50 blur-xl"></div>
        
        {/* Outer rotating ring */}
        <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-neon-cyan"></div>
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="h-3 w-3 rounded-full bg-gradient-to-r from-neon-violet to-neon-cyan shadow-glow-md shadow-neon-cyan/50"
          />
        </div>
      </div>
    </div>
  );
};

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-cyber-black/95 backdrop-blur-sm">
      <div className="text-center">
        <div className="relative mx-auto mb-6 h-24 w-24">
          {/* Outer glow */}
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-neon-violet via-neon-indigo to-neon-cyan opacity-30 blur-2xl"></div>
          
          {/* Outer ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/10 border-t-neon-violet"></div>
          
          {/* Middle ring - opposite rotation */}
          <div className="absolute inset-2 animate-spin-reverse rounded-full border-4 border-white/10 border-t-neon-indigo"></div>
          
          {/* Inner ring */}
          <div className="absolute inset-4 animate-spin rounded-full border-4 border-white/10 border-t-neon-cyan"></div>
          
          {/* Center pulsing logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-neon-violet to-neon-cyan shadow-glow-lg shadow-neon-cyan/50"
            >
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </motion.div>
          </div>
        </div>
        
        <motion.h3
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-2 bg-gradient-to-r from-neon-cyan via-neon-indigo to-neon-violet bg-clip-text text-xl font-black text-transparent"
        >
          Loading...
        </motion.h3>
        <p className="text-sm text-slate-400">Initializing system</p>
      </div>
      
      <style>{`
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Skeleton loader for posts
export const PostSkeleton = () => {
  return (
    <div className="cyber-card animate-pulse overflow-hidden">
      <div className="glass rounded-2xl border border-white/10 bg-cyber-dark/40 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-neon-violet/30 to-neon-indigo/30"></div>
          <div className="flex-1">
            <div className="mb-2 h-4 w-32 rounded-lg bg-white/10"></div>
            <div className="h-3 w-24 rounded-lg bg-white/5"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-6 w-3/4 rounded-lg bg-gradient-to-r from-neon-violet/20 to-neon-indigo/20"></div>
          <div className="h-4 w-full rounded-lg bg-white/5"></div>
          <div className="h-4 w-5/6 rounded-lg bg-white/5"></div>
          <div className="h-4 w-4/6 rounded-lg bg-white/5"></div>
        </div>
        <div className="mt-4 flex gap-4">
          <div className="h-8 w-20 rounded-lg bg-white/5"></div>
          <div className="h-8 w-24 rounded-lg bg-white/5"></div>
        </div>
      </div>
    </div>
  );
};

// Inline loader for buttons
export const ButtonLoader = () => {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
};

// Dots loader
export const DotsLoader = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        className="h-3 w-3 rounded-full bg-neon-violet shadow-glow-sm shadow-neon-violet/50"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
        className="h-3 w-3 rounded-full bg-neon-indigo shadow-glow-sm shadow-neon-indigo/50"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
        className="h-3 w-3 rounded-full bg-neon-cyan shadow-glow-sm shadow-neon-cyan/50"
      />
    </div>
  );
};
