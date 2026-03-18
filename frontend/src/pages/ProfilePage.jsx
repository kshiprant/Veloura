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
  const [locationOpen, setLocationOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    age: '',
    city: '',
    bio: '',
    intention: '',
    interests: '',
  });

  const [locationForm, setLocationForm] = useState({
    city: '',
    showDistance: true,
  });

  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [locationNotice, setLocationNotice] = useState('');

  useEffect(() => {
    setForm({
      firstName: user?.firstName || '',
      age: user?.age || '',
      city: user?.city || '',
      bio: user?.bio || '',
      intention: user?.intention || '',
      interests: (user?.interests || []).join(', '),
    });

    setLocationForm({
      city: user?.location?.city || user?.city || '',
      showDistance: user?.showDistance ?? true,
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

  const saveManualLocation = async () => {
    setSavingLocation(true);
    setLocationNotice('');

    try {
      const payload = {
        city: locationForm.city.trim(),
        location: {
          city: locationForm.city.trim(),
          source: 'manual',
        },
        showDistance: locationForm.showDistance,
      };

      const { data } = await api.put('/users/profile', payload);
      setUser(data);
      setLocationNotice('Location saved');
    } catch (error) {
      console.error('Save manual location failed:', error);
      setLocationNotice(error?.response?.data?.message || 'Failed to save location');
    } finally {
      setSavingLocation(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported on this device');
      return;
    }

    setDetectingLocation(true);
    setLocationNotice('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const payload = {
            city: locationForm.city.trim() || user?.city || '',
            location: {
              city: locationForm.city.trim() || user?.city || '',
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              source: 'gps',
            },
            showDistance: locationForm.showDistance,
          };

          const { data } = await api.put('/users/profile', payload);
          setUser(data);
          setLocationNotice('GPS location updated');
        } catch (error) {
          console.error('GPS update failed:', error);
          setLocationNotice(error?.response?.data?.message || 'Failed to update GPS location');
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        setLocationNotice('Location permission denied or unavailable');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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

            <div className="sf-drawer-scroll">
              <div className="settings-sheet">
                <div className="settings-group">
                  <div className="settings-label">Account</div>

                  <button
                    className="settings-row"
                    onClick={() => {
                      setSettingsOpen(false);
                      setEditOpen(true);
                    }}
                  >
                    <span>Edit Profile</span>
                    <span className="settings-arrow">›</span>
                  </button>

                  <button
                    className="settings-row"
                    onClick={() => setLocationOpen((prev) => !prev)}
                  >
                    <span>Location</span>
                    <span className="settings-arrow">{locationOpen ? '⌄' : '›'}</span>
                  </button>

                  {locationOpen ? (
                    <div className="settings-location-card">
                      <div className="stack gap12">
                        <input
                          value={locationForm.city}
                          onChange={(e) =>
                            setLocationForm((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          placeholder="Enter your city"
                        />

                        <label className="settings-toggle-row">
                          <span>Show distance in discover</span>
                          <input
                            type="checkbox"
                            checked={locationForm.showDistance}
                            onChange={(e) =>
                              setLocationForm((prev) => ({
                                ...prev,
                                showDistance: e.target.checked,
                              }))
                            }
                          />
                        </label>

                        <button
                          className="button outline"
                          onClick={useCurrentLocation}
                          disabled={detectingLocation}
                        >
                          {detectingLocation ? 'Detecting...' : 'Use Current Location'}
                        </button>

                        <button
                          className="button primary"
                          onClick={saveManualLocation}
                          disabled={savingLocation}
                        >
                          {savingLocation ? 'Saving...' : 'Save Location'}
                        </button>

                        {locationNotice ? (
                          <div className="muted small-text">{locationNotice}</div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <button
                    className="settings-row"
                    onClick={() => {
                      setSettingsOpen(false);
                      navigate('/settings/notifications');
                    }}
                  >
                    <span>Notifications</span>
                    <span className="settings-arrow">›</span>
                  </button>

                  <button
                    className="settings-row"
                    onClick={() => {
                      setSettingsOpen(false);
                      navigate('/settings/privacy-safety');
                    }}
                  >
                    <span>Privacy &amp; Safety</span>
                    <span className="settings-arrow">›</span>
                  </button>
                </div>

                <div className="settings-group premium-group">
                  <div className="settings-label">Subscription</div>

                  <div className="premium-card">
                    <div className="premium-card-top">
                      <h4>Get Premium</h4>
                      <span className="premium-badge">Popular</span>
                    </div>

                    <p className="muted">
                      Unlock more visibility, advanced filters, and stronger matching features.
                    </p>

                    <button
                      className="button primary premium-cta"
                      onClick={() => {
                        setSettingsOpen(false);
                        navigate('/premium');
                      }}
                    >
                      Upgrade to Premium
                    </button>
                  </div>

                  <div className="premium-card premium-card-pro">
                    <div className="premium-card-top">
                      <h4>Premium Pro Pack</h4>
                      <span className="premium-badge premium-badge-dark">Pro</span>
                    </div>

                    <p className="muted">
                      Priority placement, better reach, premium boosts, and elite profile advantages.
                    </p>

                    <button
                      className="button primary premium-cta"
                      onClick={() => {
                        setSettingsOpen(false);
                        navigate('/premium-pro');
                      }}
                    >
                      Get Pro Pack
                    </button>
                  </div>
                </div>

                <div className="settings-group">
                  <div className="settings-label">Danger Zone</div>
                  <button
                    className="settings-row settings-row-danger"
                    onClick={handleDeleteProfile}
                    disabled={deleting}
                  >
                    <span>{deleting ? 'Deleting...' : 'Delete Profile'}</span>
                    <span className="settings-arrow">›</span>
                  </button>
                </div>

                <div className="settings-group">
                  <div className="settings-label">Session</div>
                  <button className="settings-row" onClick={logout}>
                    <span>Logout</span>
                    <span className="settings-arrow">›</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
            }
