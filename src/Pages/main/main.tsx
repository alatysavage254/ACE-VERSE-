import { getDocs, collection, orderBy, query, limit } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { Post } from './post';
import { Loader } from '../../components/Loader';

export interface HOOD {
  id: string;
  userId: string;
  title: string;
  username: string;
  description: string;
}

export const Main = () => {
  const [postsList, setPostsList] = useState<HOOD[] | null>(null);
 
    useEffect (() => {
      const fetchPosts = async () => {
        const postsQuery = query(collection(db, "posts"), orderBy('createdAt', 'desc'), limit(20));
        const data = await getDocs(postsQuery);
        setPostsList(
          data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as HOOD[]
        );
      };
      fetchPosts();
    }, []);

    return (
      <div className="container" style={{ padding: '2rem 20px' }}> 
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Recent Posts
        </h1>
        {!postsList && <Loader />}
        {postsList?.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#6b7280',
            marginTop: '2rem' 
          }}>
            No posts yet. Be the first to create one!
          </div>
        )}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {postsList?.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      </div>
    );
};

