import { useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    age: user?.age || '',
    city: user?.city || '',
    bio: user?.bio || '',
    intention: user?.intention || '',
    interests: (user?.interests || []).join(', '),
    photo: user?.photos?.[0] || ''
  });

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName,
        age: Number(form.age),
        city: form.city,
        bio: form.bio,
        intention: form.intention,
        interests: form.interests.split(',').map((v) => v.trim()).filter(Boolean),
        photos: form.photo ? [form.photo] : []
      };
      const { data } = await api.put('/users/profile', payload);
      setUser(data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="stack gap16">
        <div className="soft-card profile-view-card">
          <img src={user?.photos?.[0] || 'https://placehold.co/800x1000?text=Veloura'} alt="profile" className="hero-image slim" />
          <div className="profile-body">
            <div className="row between center">
              <div>
                <h1>{user?.firstName || 'Your profile'}{user?.age ? `, ${user.age}` : ''}</h1>
                <div className="muted">{user?.city || 'Add your city'} • {user?.intention || 'Set intention'}</div>
              </div>
              <button className="button outline small" onClick={() => setEditing((v) => !v)}>{editing ? 'Cancel' : 'Edit'}</button>
            </div>
            <p>{user?.bio || 'No bio yet.'}</p>
            <div className="chip-grid">
              {(user?.interests || []).map((item) => <span key={item} className="chip-tag">{item}</span>)}
            </div>
          </div>
        </div>

        {editing ? (
          <div className="soft-card stack gap12">
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" />
            <input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Age" />
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" />
            <input value={form.intention} onChange={(e) => setForm({ ...form, intention: e.target.value })} placeholder="Intention" />
            <input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="Photo URL" />
            <input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="Interests comma separated" />
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={5} placeholder="Bio" />
            <button className="button primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
          </div>
        ) : null}

        <button className="button outline" onClick={logout}>Logout</button>
      </div>
    </AppShell>
  );
}
