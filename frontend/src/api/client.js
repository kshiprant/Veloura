import { useEffect, useMemo, useRef, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../api/client';

export default function SparkPage() {
  const [status, setStatus] = useState('idle'); // idle | matching | connected
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [revealAvailable, setRevealAvailable] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [sessionsLeft, setSessionsLeft] = useState(7);

  const pollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const statusText = useMemo(() => {
    if (status === 'matching') return 'Finding someone...';
    if (status === 'connected') return 'You are now in a live conversation.';
    return 'Start a conversation with someone new.';
  }, [status]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const loadSession = async (sessionId) => {
    try {
      const { data } = await api.get(`/conversation/${sessionId}`);
      setSession(data.session);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setRevealAvailable(Boolean(data.revealAvailable));
      setStatus('connected');
      setError('');
      scrollToBottom();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load conversation.');
    }
  };

  const startConversation = async () => {
    try {
      setLoading(true);
      setError('');
      setActionMessage('');
      setStatus('matching');

      const { data } = await api.post('/conversation/start');

      setSession(data.session);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setRevealAvailable(false);
      setSessionsLeft(
        typeof data.sessionsLeft === 'number' ? data.sessionsLeft : sessionsLeft
      );
      setStatus('connected');

      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        loadSession(data.session._id);
      }, 5000);

      scrollToBottom();
    } catch (err) {
      setStatus('idle');
      setError(err?.response?.data?.message || 'Could not start conversation.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!content.trim() || !session?._id || sending) return;

    try {
      setSending(true);
      setActionMessage('');

      const { data } = await api.post(`/conversation/${session._id}/message`, {
        content: content.trim(),
      });

      setMessages((prev) => [...prev, data.message]);
      setRevealAvailable(Boolean(data.revealAvailable));
      setContent('');
      scrollToBottom();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  const handleReveal = async () => {
    if (!session?._id) return;

    try {
      setActionMessage('');
      const { data } = await api.post(`/conversation/${session._id}/reveal`);

      if (data.revealed) {
        await loadSession(session._id);
        setActionMessage('Profiles revealed.');
      } else if (data.waiting) {
        setActionMessage('Reveal request sent. Waiting for their response.');
        await loadSession(session._id);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not process reveal.');
    }
  };

  const handleTrySomeoneElse = async () => {
    if (!session?._id) return;

    try {
      await api.post(`/conversation/${session._id}/next`);

      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }

      setSession(null);
      setMessages([]);
      setRevealAvailable(false);
      setContent('');
      setActionMessage('');
      setStatus('idle');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not end conversation.');
    }
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <AppShell>
      <section className="spark-page">
        <div className="spark-hero-card">
          <div className="spark-badge">⚡ Spark</div>
          <h1>Conversation First</h1>
          <p>{statusText}</p>
          <p className="spark-subtext">{sessionsLeft} sessions left today</p>

          {status === 'idle' && (
            <button className="primary-btn" onClick={startConversation} disabled={loading}>
              {loading ? 'Starting...' : 'Start conversation'}
            </button>
          )}

          {status === 'matching' && (
            <button className="primary-btn" disabled>
              Finding someone...
            </button>
          )}

          {status === 'connected' && (
            <div className="spark-chat-card">
              <div className="spark-chat-head">
                <div>
                  <p className="spark-preview-label">Anonymous conversation</p>
                  <h3>{session?.isRevealed ? 'Profiles revealed' : 'Still anonymous'}</h3>
                </div>

                <button className="button outline small" onClick={handleTrySomeoneElse}>
                  Try someone else
                </button>
              </div>

              <div className="spark-messages-list">
                {messages.map((msg) => {
                  const mine = msg?.sender?._id === session?.currentUserId;

                  if (msg.type === 'system') {
                    return (
                      <div key={msg._id} className="spark-system-card">
                        <span className="spark-system-tag">⚡ Conversation Starter</span>
                        <p>{msg.content}</p>
                      </div>
                    );
                  }

                  if (msg.type === 'reveal_request') {
                    return (
                      <div key={msg._id} className="spark-reveal-card">
                        <p>{msg.content}</p>
                        <button className="button primary small" onClick={handleReveal}>
                          Reveal profile
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg._id}
                      className={`message-bubble ${mine ? 'outgoing' : 'incoming'}`}
                    >
                      {msg.content}
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {actionMessage ? <p className="small-text muted">{actionMessage}</p> : null}
              {error ? <p className="error-text">{error}</p> : null}

              <div className="spark-actions-row">
                <button
                  className="button outline small"
                  onClick={handleReveal}
                  disabled={!revealAvailable}
                >
                  Reveal profile
                </button>
              </div>

              <form className="composer-row top16" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Say something worth replying to..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={2000}
                />
                <button className="button primary small" type="submit" disabled={sending}>
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
