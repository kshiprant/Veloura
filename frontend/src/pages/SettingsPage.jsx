import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [city, setCity] = useState(user?.location?.city || user?.city || '');
  const [showDistance, setShowDistance] = useState(user?.showDistance ?? true);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your profile? This cannot be undone.'
    );

    if (!confirmDelete) return;

    try {
      await api.delete('/users/profile');
      localStorage.removeItem('veloura_token');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setNotice('Geolocation not supported.');
      return;
    }

    setDetecting(true);
    setNotice('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const payload = {
            location: {
              city,
              coordinates: {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              },
              source: 'gps',
            },
            showDistance,
          };

          const { data } = await api.put('/users/profile', payload);
          setUser(data);
          setNotice('Location updated');
        } catch (err) {
          setNotice('Failed to update location');
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setDetecting(false);
        setNotice('Permission denied');
      }
    );
  };

  const handleSaveManual = async () => {
    setSaving(true);
    setNotice('');

    try {
      const payload = {
        city,
        location: {
          city,
          source: 'manual',
        },
        showDistance,
      };

      const { data } = await api.put('/users/profile', payload);
      setUser(data);
      setNotice('Location saved');
    } catch (err) {
      setNotice('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="soft-card">
        <h2>Settings</h2>

        <div className="stack gap16 top24">

          {/* LOCATION SECTION */}
          <div className="soft-card">
            <h3>Location</h3>
            <p className="muted small-text">
              Improve your discover feed with nearby profiles
            </p>

            <div className="stack gap12 top16">
              <button
                className="button outline"
                onClick={handleUseLocation}
                disabled={detecting}
              >
                {detecting ? 'Detecting...' : 'Use Current Location'}
              </button>

              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
              />

              <label className="location-toggle-row">
                <span>Show distance</span>
                <input
                  type="checkbox"
                  checked={showDistance}
                  onChange={(e) => setShowDistance(e.target.checked)}
                />
              </label>

              <button
                className="button outline"
                onClick={handleSaveManual}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Location'}
              </button>
            </div>
          </div>

          {/* ACCOUNT SECTION */}
          <div className="soft-card">
            <h3>Account</h3>

            <div className="stack gap12 top16">
              <button
                className="button outline"
                onClick={() => navigate('/premium')}
              >
                Manage Subscription
              </button>

              <button
                className="button outline"
                onClick={() => navigate('/profile')}
              >
                Back to Profile
              </button>
            </div>
          </div>

          {/* DANGER SECTION */}
          <div className="soft-card">
            <h3>Danger Zone</h3>

            <button className="button danger top16" onClick={handleDelete}>
              Delete Profile
            </button>
          </div>

          {notice && (
            <div className="success-pill">{notice}</div>
          )}
        </div>
      </div>
    </div>
  );
}
