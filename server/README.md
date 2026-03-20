# Savage MERN Backend

## Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Install dependencies:
```bash
pnpm install
```

3. Create `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/savage
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

4. Start the server:
```bash
pnpm dev
```

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user (protected)

### Users
- GET `/api/users/:id` - Get user profile
- PUT `/api/users/:id` - Update user profile (protected)

### Posts
- GET `/api/posts` - Get all posts (with pagination)
- GET `/api/posts/user/:userId` - Get user posts
- POST `/api/posts` - Create post (protected)
- DELETE `/api/posts/:id` - Delete post (protected)

### Likes
- GET `/api/likes/post/:postId` - Get post likes
- POST `/api/likes` - Add like (protected)
- DELETE `/api/likes/:postId` - Remove like (protected)

### Comments
- GET `/api/comments/post/:postId` - Get post comments
- POST `/api/comments` - Add comment (protected)

### Follows
- GET `/api/follows/check` - Check if following (protected)
- POST `/api/follows` - Follow user (protected)
- DELETE `/api/follows/:followingId` - Unfollow user (protected)
