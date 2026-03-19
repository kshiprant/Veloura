import { useMemo, useState } from 'react';
import AppShell from '../components/AppShell';

export default function SparkPage() {
  const [sessionLeft] = useState(7);
  const [status, setStatus] = useState('idle'); // idle | matching | connected

  const statusText = useMemo(() => {
    if (status === 'matching') return 'Finding someone...';
    if (status === 'connected') return 'You are now in a live conversation.';
    return 'Start a conversation with someone new.';
  }, [status]);

  const handleStart = () => {
    setStatus('matching');

    // Temporary mock flow for UI
    setTimeout(() => {
      setStatus('connected');
    }, 1500);
  };

  return (
    <AppShell>
      <section className="spark-page">
        <div className="spark-hero-card">
          <div className="spark-badge">⚡ Spark</div>
          <h1>Conversation First</h1>
          <p>{statusText}</p>
          <p className="spark-subtext">{sessionLeft} sessions left today</p>

          {status === 'idle' && (
            <button className="primary-btn" onClick={handleStart}>
              Start conversation
            </button>
          )}

          {status === 'matching' && (
            <button className="primary-btn" disabled>
              Finding someone...
            </button>
          )}

          {status === 'connected' && (
            <div className="spark-preview-box">
              <p className="spark-preview-label">Live prompt</p>
              <h3>What’s a hill you’ll die on?</h3>
              <p className="spark-preview-note">
                Anonymous chat UI will appear here next.
              </p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
