import { addDoc, getDocs, collection, query, where, deleteDoc, doc, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import {  HOOD as IPost } from './main';
import { auth, db } from '../../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState, useCallback, memo } from 'react';
import { Loader } from '../../components/Loader';
import { useToast } from '../../components/Toast';

 
interface Props {
  post: IPost;
}

interface Like{
  likeId: string;
  userId: string;
}

export const Post = memo((props: Props) => {
  const { post } = props;
  const [ user ]  = useAuthState (auth);
  const { addToast } = useToast();

  const [likes,setLikes] = useState<Like[] | null>(null);
  const [currentTitle, setCurrentTitle] = useState(post.title);
  const [currentDescription, setCurrentDescription] = useState(post.description);

   
  const likesRef = collection (db, "likes");
  const commentsRef = collection(db, "posts", post.id, "comments");



  const likesDoc = query(likesRef, where("postId", "==", post.id));
  const commentsQuery = query(commentsRef, orderBy("createdAt", "asc"));

  const getLikes = useCallback(async () => {
    const data = await getDocs(likesDoc);
    setLikes(data.docs.map((doc) => ({ userId: doc.data().userId, likeId: doc.id })));
  }, [likesDoc]);

  type Comment = {
    id: string;
    userId: string;
    username: string | null;
    text: string;
    createdAt?: any;
  };
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);

  const getComments = useCallback(async () => {
    const data = await getDocs(commentsQuery);
    setComments(
      data.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Comment[]
    );
  }, [commentsQuery]);

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
      if (user.uid !== post.userId) addToast('Someone liked your post');
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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDelete = async () => {
    if (deleting) return <Loader />;
    
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

  const handleAddComment = async () => {
    if (!user) {
      alert('You must be signed in to comment.');
      return;
    }
    const trimmed = newComment.trim();
    if (!trimmed) return;
    try {
      await addDoc(commentsRef, {
        text: trimmed,
        userId: user.uid,
        username: user.displayName || null,
        createdAt: serverTimestamp(),
      });
      setNewComment("");
      await getComments();
      if (user.uid !== post.userId) addToast('New comment on your post');
    } catch (e) {
      console.error(e);
      alert('Failed to add comment');
    }
  };

  const isOwner = user?.uid === post.userId;

  const handleSaveEdit = async () => {
    if (!isOwner) return;
    const trimmedTitle = currentTitle.trim();
    const trimmedDesc = currentDescription.trim();
    if (!trimmedTitle || !trimmedDesc) {
      alert('Title and description are required.');
      return;
    }
    setSaving(true);
    try {
      const postDoc = doc(db, "posts", post.id);
      await updateDoc(postDoc, { title: trimmedTitle, description: trimmedDesc });
      setEditing(false);
    } catch (e) {
      console.error(e);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
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
        {editing ? (
          <input
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              marginBottom: 10,
              fontSize: '1.1em',
              fontWeight: 600,
            }}
          />
        ) : (
          <h3 style={{ margin: '0 0 10px 0' }}>{currentTitle}</h3>
        )}
        {/** Image thumbnail */}
        {Boolean((post as any).imageUrl) && (
          <div style={{ margin: '10px 0' }}>
            <img
              src={(post as any).imageUrl as string}
              alt={currentTitle}
              style={{
                maxWidth: '100%',
                borderRadius: 8,
                display: 'block',
                margin: '0 auto'
              }}
            />
          </div>
        )}
        {editing ? (
          <textarea
            value={currentDescription}
            onChange={(e) => setCurrentDescription(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              marginBottom: 10,
            }}
          />
        ) : (
          <p style={{ margin: '0 0 15px 0' }}>{currentDescription}</p>
        )}
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
        <div style={{ display: 'flex', gap: 8 }}>
          {isOwner && (
            editing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '5px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setCurrentTitle(post.title);
                    setCurrentDescription(post.description);
                  }}
                  style={{
                    backgroundColor: '#9ca3af',
                    color: 'white',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
            )
          )}
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
      <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ textAlign: 'left', margin: '0 0 10px 0' }}>Comments</h4>
          <button
            onClick={async () => {
              const next = !commentsOpen;
              setCommentsOpen(next);
              if (next && comments == null) {
                await getComments();
              }
            }}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '6px 10px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {commentsOpen ? 'Hide' : 'Show'}
          </button>
        </div>
        {!commentsOpen && <p style={{ color: '#6b7280', textAlign: 'left' }}>Hidden</p>}
        {commentsOpen && !comments && <Loader />}
        {commentsOpen && comments?.length === 0 && (
          <p style={{ color: '#6b7280', textAlign: 'left' }}>No comments yet.</p>
        )}
        {commentsOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {comments?.map((c) => (
              <div key={c.id} style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>@{c.username || 'anon'}</div>
                <div>{c.text}</div>
              </div>
            ))}
          </div>
        )}
        {commentsOpen && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? 'Write a comment…' : 'Sign in to comment'}
              disabled={!user}
              style={{ flex: 1, padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
            />
            <button
              onClick={handleAddComment}
              disabled={!user || !newComment.trim()}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '6px',
                cursor: (!user || !newComment.trim()) ? 'not-allowed' : 'pointer',
                opacity: (!user || !newComment.trim()) ? 0.7 : 1,
              }}
            >
              Comment
            </button>
          </div>
        )}
      </div>
    </div>
  )
})