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
    if (!user) {
      alert('You must be signed in to like posts.');
      return;
    }
    try {
      const newDoc = await addDoc(likesRef, { userId: user.uid, postId: post.id });
      setLikes((prev) =>
        prev ? [...prev, { userId: user.uid, likeId: newDoc.id }] : [{ userId: user.uid, likeId: newDoc.id }]
      );
    } catch (err) {
      console.log(err);
    }

  };

  const removeLike = async () => {
    if (!user) {
      alert('You must be signed in to unlike posts.');
      return;
    }
    try {
      const likeToDeleteQuery = query(
        likesRef,
        where("postId", "==", post.id),
        where("userId", "==", user.uid)
        );

      const likeToDeleteData = await getDocs(likeToDeleteQuery);
      if (likeToDeleteData.empty) {
        return;
      }
      const likeId = likeToDeleteData.docs[0].id;
      const likeToDelete = doc(db, "likes", likeId);
    await deleteDoc(likeToDelete);
    setLikes (
      (prev) => prev && prev.filter((like) => like.likeId !== likeId)
    );
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
    if (!user || user.uid !== post.userId || deleting) return;
    
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setDeleting(true);
    try {
      // Delete all likes for this post first
      const likesToDelete = await getDocs(likesDoc);
      const deletePromises = likesToDelete.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Then delete the post
      const postDoc = doc(db, "posts", post.id);
      await deleteDoc(postDoc);

      // Refresh the posts list (you'll need to implement this in main.tsx)
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post. Check console for details.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '1rem' }}>
      <div className="title">
        <h1>{post.title}</h1>
      </div> 
      <div className='body'>
        <p>{post.description}</p>
      </div>
      <div className="footer">
        <p>@{post.username}</p>
        <button onClick={hasUserLiked ? removeLike : addLike} disabled={!user}>
          {hasUserLiked ? <>&#128078;</> : <>&#128077;</>}
        </button>
        {likes && <p>Likes: {likes?.length}</p>}
        
        {user?.uid === post.userId && (
          <button 
            onClick={handleDelete} 
            disabled={deleting}
            style={{ 
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              marginLeft: '1rem',
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.7 : 1
            }}
          >
            {deleting ? 'Deleting...' : 'Delete Post'}
          </button>
        )}
      </div>
    </div>
  )
}