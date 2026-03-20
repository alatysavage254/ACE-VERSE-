// filename: src/components/SkeletonLoader.tsx
import React from 'react';

export const PostSkeleton = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/6"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
      <div className="flex-1">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
  </div>
);
