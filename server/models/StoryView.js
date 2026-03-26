import mongoose from 'mongoose';

const storyViewSchema = new mongoose.Schema({
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  viewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewerUsername: {
    type: String,
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
storyViewSchema.index({ storyId: 1 });
storyViewSchema.index({ storyId: 1, viewerId: 1 }, { unique: true }); // Prevent duplicate views

export default mongoose.model('StoryView', storyViewSchema);
