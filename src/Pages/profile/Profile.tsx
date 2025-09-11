import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

type UserDoc = {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
};

type Post = {
  id: string;
  title: string;
  description: string;
  username: string | null;
  userId: string;
  imageUrl?: string | null;
};

export const Profile = () => {
  const { uid } = useParams();
  const [user, setUser] = useState<UserDoc | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!uid) return;
      try {
        const userSnap = await getDoc(doc(db, 'users', uid));
        if (userSnap.exists()) {
          setUser(userSnap.data() as UserDoc);
        } else {
          setUser(null);
        }
        const postsQ = query(collection(db, 'posts'), where('userId', '==', uid));
        const postsSnap = await getDocs(postsQ);
        setPosts(postsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Post[]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [uid]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 20px' }}>
        <div>Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: '2rem 20px' }}>
        <h2>User not found</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 20px', maxWidth: 800 }}>
      <div className="card" style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={user.photoURL || ''} alt={user.displayName || 'User'} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <h2 style={{ margin: 0 }}>{user.displayName || 'Anonymous'}</h2>
            <div style={{ color: '#6b7280' }}>{user.email || ''}</div>
          </div>
        </div>
      </div>

      <h3 style={{ textAlign: 'left', margin: '1rem 0' }}>Posts</h3>
      {posts?.length === 0 && <div className="card">No posts yet.</div>}
      {posts?.map(p => (
        <div key={p.id} className="card" style={{ textAlign: 'left' }}>
          <h4 style={{ marginTop: 0 }}>{p.title}</h4>
          {p.imageUrl && (
            <img src={p.imageUrl} alt={p.title} style={{ maxWidth: '100%', borderRadius: 8, margin: '8px 0' }} />
          )}
          <p>{p.description}</p>
          <div style={{ color: '#6b7280' }}>@{p.username}</div>
        </div>
      ))}
    </div>
  );
};

