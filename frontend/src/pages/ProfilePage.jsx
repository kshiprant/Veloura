import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const placeholderImage = 'https://placehold.co/800x1000?text=Veloura';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    age: '',
    city: '',
    bio: '',
    intention: '',
    interests: '',
  });

  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    setForm({
      firstName: user?.firstName || '',
      age: user?.age || '',
      city: user?.city || '',
      bio: user?.bio || '',
      intention: user?.intention || '',
      interests: (user?.interests || []).join(', '),
    });

    setPhotoPreview(user?.photos?.[0] || '');
    setSelectedPhotoFile(null);
  }, [user, editOpen]);

  useEffect(() => {
    if (!selectedPhotoFile) return;

    const previewUrl = URL.createObjectURL(selectedPhotoFile);
    setPhotoPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedPhotoFile]);

  const displayImage = useMemo(() => {
    return user?.photos?.[0] || placeholderImage;
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedPhotoFile(file);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setSelectedPhotoFile(null);
    setPhotoPreview(user?.photos?.[0] || '');
  };

  const save = async () => {
    setSaving(true);

    try {
      let uploadedPhotos = user?.photos || [];

      if (selectedPhotoFile) {
        const photoData = new FormData();
        photoData.append('photo', selectedPhotoFile);

        const uploadRes = await api.post('/users/profile/photo', photoData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadRes?.data?.photoUrl) {
          uploadedPhotos = [uploadRes.data.photoUrl];
        }
      }

      const payload = {
        firstName: form.firstName.trim(),
        age: form.age ? Number(form.age) : null,
        city: form.city.trim(),
        bio: form.bio.trim(),
        intention: form.intention.trim(),
        interests: form.interests
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        photos: uploadedPhotos,
      };

      const { data } = await api.put('/users/profile', payload);
      setUser(data);
      setEditOpen(false);
      setSelectedPhotoFile(null);
    } catch (error) {
      console.error('Profile save failed:', error);
      alert(error?.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your profile? This cannot be undone.'
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.delete('/users/profile');
      localStorage.removeItem('veloura_token');
      navigate('/login');
    } catch (error) {
      console.error('Delete profile failed:', error);
      alert(error?.response?.data?.message || 'Failed to delete profile');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell>
      <div className="stack gap16">
        <div className="soft-card profile-view-card">
          <div className="profile-top-actions">
            <button
              className="button ghost small"
              onClick={() => setSettingsOpen(true)}
            >
              Settings
            </button>
          </div>

          <img
            src={displayImage}
            alt="profile"
            className="hero-image slim"
          />

          <div className="profile-body">
            <div className="row between center gap12 profile-heading-row">
              <div>
                <h1>
                  {user?.firstName || 'Your profile'}
                  {user?.age ? `, ${user.age}` : ''}
                </h1>
                <div className="muted">
                  {user?.city || 'Add your city'} • {user?.intention || 'Set intention'}
                </div>
              </div>

              <button
                className="button outline small"
                onClick={() => setEditOpen(true)}
              >
                Edit Profile
              </button>
            </div>

            <p>{user?.bio || 'No bio yet.'}</p>

            {(user?.interests || []).length ? (
              <div className="chip-grid">
                {(user?.interests || []).map((item) => (
                  <span key={item} className="chip-tag">
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="soft-card profile-quick-actions">
          <div className="profile-section-head">
            <h3 className="section-title">Quick Access</h3>
            <div className="muted small-text">Everything important, one tap away.</div>
          </div>

          <div className="quick-action-grid">
            <button
              className="quick-action-card quick-action-card-wide"
              onClick={() => setSettingsOpen(true)}
            >
              <div className="quick-action-icon">⚙</div>
              <div className="quick-action-text">
                <div className="quick-action-title">Settings</div>
                <div className="quick-action-subtitle">Premium, account, and preferences</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {editOpen ? (
        <div className="sf-drawer-overlay" onClick={closeEdit}>
          <div
            className="sf-drawer profile-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sf-drawer-handle" />
            <div className="sf-drawer-header-row">
              <h3>Edit Profile</h3>
              <button className="button ghost small" onClick={closeEdit}>
                Close
              </button>
            </div>

            <div className="stack gap12 sf-drawer-scroll">
              <div className="photo-upload-card">
                <div className="photo-upload-preview-wrap">
                  <img
                    src={photoPreview || user?.photos?.[0] || placeholderImage}
                    alt="preview"
                    className="photo-upload-preview"
                  />
                </div>

                <label className="button outline photo-upload-button">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    hidden
                  />
                </label>
              </div>

              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="First name"
              />

              <input
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="Age"
                inputMode="numeric"
              />

              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
              />

              <input
                value={form.intention}
                onChange={(e) => setForm({ ...form, intention: e.target.value })}
                placeholder="Intention"
              />

              <input
                value={form.interests}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                placeholder="Interests comma separated"
              />

              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={5}
                placeholder="Bio"
              />

              <button
                className="button primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {settingsOpen ? (
        <div
          className="sf-drawer-overlay"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="sf-drawer profile-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sf-drawer-handle" />
            <div className="sf-drawer-header-row">
              <h3>Settings</h3>
              <button
                className="button ghost small"
                onClick={() => setSettingsOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="stack gap12 sf-drawer-scroll">
              <div className="settings-block">
                <div className="settings-label">Account</div>
                <button
                  className="button outline"
                  onClick={() => {
                    setSettingsOpen(false);
                    setEditOpen(true);
                  }}
                >
                  Edit Profile
                </button>
                <button className="button outline">Notifications</button>
                <button className="button outline">Privacy & Safety</button>
              </div>

              <div className="settings-block premium-block">
                <div className="settings-label">Subscription</div>

                <div className="premium-card">
                  <h4>Get Premium</h4>
                  <p className="muted">
                    Unlock more visibility, advanced filters, and stronger matching features.
                  </p>
                  <button className="button primary">Upgrade to Premium</button>
                </div>

                <div className="premium-card premium-card-pro">
                  <h4>Premium Pro Pack</h4>
                  <p className="muted">
                    Priority placement, better reach, premium boosts, and elite profile advantages.
                  </p>
                  <button className="button primary">Get Pro Pack</button>
                </div>
              </div>

              <div className="settings-block">
                <div className="settings-label">Danger Zone</div>
                <button
                  className="button outline dangerish"
                  onClick={handleDeleteProfile}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Profile'}
                </button>
              </div>

              <div className="settings-block">
                <div className="settings-label">Session</div>
                <button className="button outline" onClick={logout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
