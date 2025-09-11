import { addDoc, getDocs, collection, query, where, deleteDoc, doc } from 'firebase/firestore';
import {  HOOD as IPost } from './main';
import { auth, db } from '../../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState, useCallback } from 'react';

 
interface Props {
  post: IPost;
}

interface Like{
  likeId: string;
  userId: string;
}

export const Post = (props: Props) => {
  const { post } = props;
  const [ user ]  = useAuthState (auth);

  const [likes,setLikes] = useState<Like[] | null>(null);

   
  const likesRef = collection (db, "likes");



  const likesDoc = query(likesRef, where("postId", "==", post.id));

  const getLikes = useCallback(async () => {
    const data = await getDocs(likesDoc);
    setLikes(data.docs.map((doc) => ({ userId: doc.data().userId, likeId: doc.id })));
  }, [likesDoc]);

  const addLike = async () => {
    try {
     const newDoc =  await addDoc(likesRef, { userId: user?.uid, postId: post.id });
    if (user) {
      setLikes((prev) =>
        prev ? [...prev, { userId: user.uid, likeId: newDoc.id }] : [{ userId: user.uid, likeId: newDoc.id }]
      );
    }
  }  catch (err) {
    console.log(err);
  }

  };

  const removeLike = async () => {
    try {
      const likeToDeleteQuery = query(
        likesRef,
        where("postId", "==", post.id),
        where("userId", "==", user?.uid)
        );

      const likeToDeleteData = await getDocs(likeToDeleteQuery);
      const likeId = likeToDeleteData.docs[0].id;
      const likeToDelete = doc(db, "likes", likeId);
    await deleteDoc(likeToDelete);
    if (user) {
      setLikes (
        (prev) => prev && prev.filter((like) => like.likeId !== likeId)
    );

    }
  }  catch (err) {
    console.log(err);
  }

  };

  
  
  const hasUserLiked = likes?.find((like) => like.userId === user?.uid);
  
  useEffect(() => {
    getLikes();
  }, [getLikes]);
  

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setDeleting(true);
    try {
      // Delete all likes for this post first
      const likesToDelete = await getDocs(likesDoc);
      
      // Delete likes in batches to avoid potential issues
      for (const doc of likesToDelete.docs) {
        try {
          await deleteDoc(doc.ref);
        } catch (error) {
          console.warn('Failed to delete like, continuing...', error);
        }
      }

      // Then delete the post
      const postDoc = doc(db, "posts", post.id);
      await deleteDoc(postDoc);

      // Use window.location.href to ensure clean navigation
      window.location.href = '/';
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      alert(err?.message || 'Failed to delete post. Make sure you have permission.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      margin: '10px 0',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '10px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>{post.title}</h3>
        <p style={{ margin: '0 0 15px 0' }}>{post.description}</p>
        <p style={{ color: '#666', fontSize: '0.9em', margin: '0' }}>@{post.username}</p>
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '10px'
      }}>
        <div>
          <button 
            onClick={hasUserLiked ? removeLike : addLike}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '1.1em',
              padding: '5px 10px'
            }}
          >
            {hasUserLiked ? '❤️' : '🤍'}
            <span style={{ marginLeft: '5px' }}>{likes?.length || 0}</span>
          </button>
        </div>
        <button 
          onClick={handleDelete}
          disabled={deleting}
          style={{
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: deleting ? 'not-allowed' : 'pointer',
            opacity: deleting ? 0.7 : 1
          }}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}