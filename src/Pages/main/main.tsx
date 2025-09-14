import { getDocs, collection, orderBy, query, limit } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { Post } from './post';
import type { PostType } from '../../types/post';
import { Loader } from '../../components/Loader';
import styles from '../../styles/main.module.css';

export const Main = () => {
  const [postsList, setPostsList] = useState<PostType[] | null>(null);
 
    useEffect (() => {
      const fetchPosts = async () => {
        const postsQuery = query(collection(db, "posts"), orderBy('createdAt', 'desc'), limit(20));
        const data = await getDocs(postsQuery);
        setPostsList(
          data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as PostType[]
        );
      };
      fetchPosts();
    }, []);

    return (
      <div className={styles.mainContainer}> 
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>
            Recent Posts
            <div className={styles.titleUnderline} />
          </h1>

          {!postsList && (
            <div className={styles.loaderContainer}>
              <Loader />
            </div>
          )}

          {postsList?.length === 0 && (
            <div className={styles.emptyState}>
              No posts yet. Be the first to create one!
            </div>
          )}

          <div className={styles.postsGrid}>
            {postsList?.map((post) => (
              <div key={post.id} className={styles.postContainer}>
                <Post post={post} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
};

