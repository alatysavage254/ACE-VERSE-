import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'tooryan18@gmail.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User with email ${email} not found`);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();

    console.log(`✅ ${email} is now an admin!`);
    console.log('User details:', {
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
