import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { storiesService } from '../services/stories.service';
import { useAuthContext } from '../context/AuthContext';
import { X, Upload } from 'lucide-react';

interface StoryCreatorProps {
  onClose: () => void;
  onStoryCreated: () => void;
}

export const StoryCreator = ({ onClose, onStoryCreated }: StoryCreatorProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const { user } = useAuthContext();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type - only images allowed
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB max for images)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    try {
      // Upload to Firebase Storage with proper metadata
      const storageRef = ref(storage, `stories/${user._id}/${Date.now()}_${file.name}`);
      
      // Set metadata to help with CORS
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: user._id
        }
      };
      
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const mediaUrl = await getDownloadURL(snapshot.ref);

      // Create story - only images supported
      await storiesService.createStory(mediaUrl, 'image');

      onStoryCreated();
      onClose();
    } catch (error: any) {
      console.error('Failed to create story:', error);
      if (error.code === 'storage/unauthorized') {
        alert('Upload failed: Please check Firebase Storage permissions');
      } else if (error.message?.includes('CORS')) {
        alert('Upload failed: CORS issue. Please configure Firebase Storage CORS settings.');
      } else {
        alert('Failed to create story. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Create Story</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {!preview ? (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500">
            <Upload size={48} className="text-gray-400 mb-2" />
            <span className="text-gray-400">Click to upload image</span>
            <span className="text-gray-500 text-sm mt-1">Max 10MB</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFile(null);
                  setPreview('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Change
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Share Story'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
