import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function SettingsPage() {
  const navigate = useNavigate();

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

  return (
    <div className="auth-page">
      <div className="soft-card">
        <h2>Settings</h2>

        <div className="stack gap16 top32">
          <button className="button danger" onClick={handleDelete}>
            Delete Profile
          </button>
        </div>
      </div>
    </div>
  );
}
