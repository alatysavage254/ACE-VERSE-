import { useState, useEffect } from 'react';
import { storiesService, StoryGroup } from '../services/stories.service';
import { useAuthContext } from '../context/AuthContext';

interface StoryRingProps {
  onStoryClick: (group: StoryGroup, initialIndex: number) => void;
}

export const StoryRing = ({ onStoryClick }: StoryRingProps) => {
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    fetchStories();
    const interval = setInterval(fetchStories, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStories = async () => {
    try {
      const groups = await storiesService.getFeedStories();
      setStoryGroups(groups);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (storyGroups.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide bg-black border-b border-gray-800">
      {storyGroups.map((group) => {
        const isOwnStory = group.userId === user?._id;
        const ringColor = group.hasUnviewed
          ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
          : 'bg-gray-600';

        return (
          <button
            key={group.userId}
            onClick={() => onStoryClick(group, 0)}
            className="flex-shrink-0 flex flex-col items-center gap-1 focus:outline-none"
          >
            <div className={`p-0.5 rounded-full ${ringColor}`}>
              <div className="w-16 h-16 rounded-full bg-black p-0.5">
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-white font-semibold">
                  {group.username.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
            <span className="text-xs text-white truncate max-w-[70px]">
              {isOwnStory ? 'Your Story' : group.username}
            </span>
          </button>
        );
      })}
    </div>
  );
};
