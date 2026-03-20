// filename: src/components/SkeletonLoader.tsx
import React from 'react';
import { motion } from 'framer-motion';

export const PostSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="cyber-card animate-pulse overflow-hidden"
  >
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
  </motion.div>
);

export const ProfileSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="cyber-card animate-pulse overflow-hidden"
  >
    <div className="glass rounded-2xl border border-white/10 bg-cyber-dark/40 p-8 backdrop-blur-xl">
      <div className="mb-8 flex items-center gap-6">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-violet/30 to-neon-cyan/30 blur-lg"></div>
          <div className="relative h-24 w-24 rounded-full border-4 border-neon-violet/30 bg-cyber-dark"></div>
        </div>
        <div className="flex-1">
          <div className="mb-3 h-8 w-48 rounded-lg bg-gradient-to-r from-neon-violet/20 to-neon-indigo/20"></div>
          <div className="mb-2 h-4 w-32 rounded-lg bg-white/5"></div>
          <div className="mt-3 flex gap-4">
            <div className="h-6 w-24 rounded-lg bg-white/5"></div>
            <div className="h-6 w-24 rounded-lg bg-white/5"></div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded-lg bg-white/5"></div>
        <div className="h-4 w-5/6 rounded-lg bg-white/5"></div>
        <div className="h-4 w-3/4 rounded-lg bg-white/5"></div>
      </div>
    </div>
  </motion.div>
);

export const CardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="cyber-card animate-pulse overflow-hidden"
  >
    <div className="glass rounded-xl border border-white/10 bg-cyber-dark/40 p-4 backdrop-blur-xl">
      <div className="mb-3 h-5 w-2/3 rounded-lg bg-gradient-to-r from-neon-violet/20 to-neon-indigo/20"></div>
      <div className="mb-2 h-4 w-full rounded-lg bg-white/5"></div>
      <div className="h-4 w-4/5 rounded-lg bg-white/5"></div>
    </div>
  </motion.div>
);
