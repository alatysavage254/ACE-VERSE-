import { getDocs, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { Post } from './post'

export interface HOOD {
  id: string;
  userId: string;
  title: string;
  username: string;
  description: string;
}

export const Main = () => {
  const [postsList, setPostsList] = useState<HOOD[] | null>(null);
 
    useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(db, "posts");
        const data = await getDocs(postsCollection);
        const posts = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id
        })) as HOOD[];
        setPostsList(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPostsList([]);
      }
    };
    fetchPosts();
  }, []);

    return (
      <div> 
        {postsList?.map((post) => (
          <Post key={post.id} post={post} />
        ))} 
      </div>
    );

        };

