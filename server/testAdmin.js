import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';
import { generateToken } from './utils/generateToken.js';

dotenv.config();

const testAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB:', process.env.MONGODB_URI.includes('localhost') ? 'localhost' : 'Atlas');

    // Check if admin user exists
    const adminEmail = 'tooryan18@gmail.com';
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.log(`\n❌ Admin user ${adminEmail} not found in database`);
      console.log('You need to log in with Google first to create the user');
      process.exit(1);
    }

    console.log(`\n✅ Admin user found:`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   isAdmin: ${adminUser.isAdmin}`);
    console.log(`   User ID: ${adminUser._id}`);

    // Generate token for admin
    const token = generateToken(adminUser._id);
    console.log(`\n🔑 Admin Token: ${token}`);

    // Get a post from another user
    const otherUserPost = await Post.findOne({ userId: { $ne: adminUser._id } });
    
    if (!otherUserPost) {
      console.log('\n⚠️  No posts from other users found to test delete');
    } else {
      console.log(`\n📝 Found post from another user:`);
      console.log(`   Post ID: ${otherUserPost._id}`);
      console.log(`   Title: ${otherUserPost.title}`);
      console.log(`   Owner: ${otherUserPost.username} (${otherUserPost.userId})`);
      
      console.log(`\n🧪 Test delete command:`);
      console.log(`curl -X DELETE http://localhost:5000/api/posts/${otherUserPost._id} \\`);
      console.log(`  -H "Authorization: Bearer ${token}"`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testAdmin();
