import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../api/client';
import { getSocket } from '../api/socket';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const loadMatches = async () => {
    const { data } = await api.get('/users/matches');
    setMatches(data);
    if (!activeMatch && data[0]) setActiveMatch(data[0]);
  };

  const loadMessages = async (matchId) => {
    const { data } = await api.get(`/messages/${matchId}`);
    setMessages(data);
  };

  useEffect(() => { loadMatches(); }, []);
  useEffect(() => {
    if (!activeMatch?._id) return;
    loadMessages(activeMatch._id);
    const socket = getSocket();
    socket?.emit('join_match', activeMatch._id);
    const handler = (message) => {
      if (message.matchId === activeMatch._id) {
        setMessages((prev) => [...prev, message]);
      }
    };
    socket?.on('new_message', handler);
    return () => socket?.off('new_message', handler);
  }, [activeMatch?._id]);

  const send = async () => {
    if (!text.trim() || !activeMatch?._id) return;
    const socket = getSocket();
    socket?.emit('send_message', { matchId: activeMatch._id, content: text });
    setText('');
  };

  const sidebar = useMemo(() => (
    <div className="matches-sidebar soft-card">
      <h3>Matches</h3>
      <div className="stack gap12 top16">
        {matches.map((match) => (
          <button key={match._id} className={`match-row ${activeMatch?._id === match._id ? 'active' : ''}`} onClick={() => setActiveMatch(match)}>
            <img src={match.otherUser?.photos?.[0] || 'https://placehold.co/80x80?text=V'} alt="avatar" />
            <div>
              <div className="strong">{match.otherUser?.firstName}</div>
              <div className="muted small-text">{match.otherUser?.city}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  ), [matches, activeMatch]);

  return (
    <AppShell>
      <div className="matches-layout">
        {sidebar}
        <div className="chat-card soft-card">
          {activeMatch ? (
            <>
              <div className="chat-header">
                <img src={activeMatch.otherUser?.photos?.[0] || 'https://placehold.co/80x80?text=V'} alt="avatar" />
                <div>
                  <div className="strong">{activeMatch.otherUser?.firstName}</div>
                  <div className="muted small-text">{activeMatch.otherUser?.intention}</div>
                </div>
              </div>
              <div className="messages-list">
                {messages.map((message) => (
                  <div key={message._id} className={`message-bubble ${message.sender?._id === activeMatch.otherUser?._id ? 'incoming' : 'outgoing'}`}>
                    {message.content}
                  </div>
                ))}
              </div>
              <div className="composer-row">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
                <button className="button primary small" onClick={send}>Send</button>
              </div>
            </>
          ) : (
            <div>Select a match to start chatting.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
