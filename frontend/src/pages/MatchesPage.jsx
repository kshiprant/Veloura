import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../api/client';
import { getSocket } from '../api/socket';

const TABS = {
  LIKED_YOU: 'liked-you',
  MATCHES: 'matches',
  CHATS: 'chats',
};

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState(TABS.MATCHES);

  const [matches, setMatches] = useState([]);
  const [likesReceived, setLikesReceived] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [likesSupported, setLikesSupported] = useState(true);

  const loadMatches = async () => {
    try {
      setLoadingMatches(true);
      const { data } = await api.get('/users/matches');
      const matchList = Array.isArray(data) ? data : [];
      setMatches(matchList);

      if (!activeMatch && matchList[0]) {
        setActiveMatch(matchList[0]);
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoadingMatches(false);
    }
  };

  const loadLikesReceived = async () => {
    try {
      setLoadingLikes(true);
      const { data } = await api.get('/users/likes-received');
      setLikesReceived(Array.isArray(data) ? data : []);
      setLikesSupported(true);
    } catch (error) {
      console.error('Likes received endpoint not ready:', error);
      setLikesSupported(false);
      setLikesReceived([]);
    } finally {
      setLoadingLikes(false);
    }
  };

  const loadMessages = async (matchId) => {
    try {
      setLoadingMessages(true);
      const { data } = await api.get(`/messages/${matchId}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadMatches();
    loadLikesReceived();
  }, []);

  useEffect(() => {
    if (activeTab !== TABS.CHATS) return;
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
  }, [activeMatch?._id, activeTab]);

  const send = async () => {
    if (!text.trim() || !activeMatch?._id) return;

    try {
      const socket = getSocket();
      socket?.emit('send_message', {
        matchId: activeMatch._id,
        content: text.trim(),
      });
      setText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const openChat = (match) => {
    setActiveMatch(match);
    setActiveTab(TABS.CHATS);
  };

  const matchesList = useMemo(() => {
    if (loadingMatches) {
      return <div className="muted">Loading matches...</div>;
    }

    if (!matches.length) {
      return (
        <div className="empty-state-card">
          <div className="strong">No matches yet</div>
          <div className="muted small-text">
            When two people like each other, they will appear here.
          </div>
        </div>
      );
    }

    return (
      <div className="stack gap12 top12">
        {matches.map((match) => (
          <div
            key={match._id}
            className={`match-row-card ${activeMatch?._id === match._id ? 'active' : ''}`}
          >
            <button
              className="match-row match-row-main"
              onClick={() => setActiveMatch(match)}
            >
              <img
                src={match.otherUser?.photos?.[0] || 'https://placehold.co/80x80?text=V'}
                alt="avatar"
              />
              <div className="match-row-content">
                <div className="strong">{match.otherUser?.firstName || 'User'}</div>
                <div className="muted small-text">
                  {match.otherUser?.city || 'Location hidden'}
                </div>
                <div className="muted small-text">
                  {match.otherUser?.intention || 'No intention set'}
                </div>
              </div>
            </button>

            <button
              className="button primary small"
              onClick={() => openChat(match)}
            >
              Chat
            </button>
          </div>
        ))}
      </div>
    );
  }, [matches, activeMatch, loadingMatches]);

  const likesList = useMemo(() => {
    if (loadingLikes) {
      return <div className="muted">Loading likes...</div>;
    }

    if (!likesSupported) {
      return (
        <div className="empty-state-card">
          <div className="strong">Liked You is not connected yet</div>
          <div className="muted small-text">
            Frontend tab is ready. Backend route still needs to be added.
          </div>
        </div>
      );
    }

    if (!likesReceived.length) {
      return (
        <div className="empty-state-card">
          <div className="strong">No likes yet</div>
          <div className="muted small-text">
            People who like your profile will appear here.
          </div>
        </div>
      );
    }

    return (
      <div className="stack gap12 top12">
        {likesReceived.map((person) => (
          <div key={person._id} className="match-row-card">
            <div className="match-row match-row-main static-row">
              <img
                src={person?.photos?.[0] || 'https://placehold.co/80x80?text=V'}
                alt="avatar"
              />
              <div className="match-row-content">
                <div className="strong">{person?.firstName || 'User'}</div>
                <div className="muted small-text">
                  {person?.city || 'Location hidden'}
                </div>
                <div className="muted small-text">
                  {person?.intention || 'No intention set'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [likesReceived, loadingLikes, likesSupported]);

  const chatPanel = useMemo(() => {
    if (!activeMatch) {
      return (
        <div className="empty-state-card">
          <div className="strong">No active chat</div>
          <div className="muted small-text">
            Select a match to start chatting.
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="chat-header">
          <img
            src={activeMatch.otherUser?.photos?.[0] || 'https://placehold.co/80x80?text=V'}
            alt="avatar"
          />
          <div>
            <div className="strong">{activeMatch.otherUser?.firstName || 'User'}</div>
            <div className="muted small-text">
              {activeMatch.otherUser?.intention || 'No intention set'}
            </div>
          </div>
        </div>

        <div className="messages-list">
          {loadingMessages ? (
            <div className="muted">Loading messages...</div>
          ) : messages.length ? (
            messages.map((message) => {
              const isIncoming =
                message.sender?._id === activeMatch.otherUser?._id;

              return (
                <div
                  key={message._id}
                  className={`message-bubble ${isIncoming ? 'incoming' : 'outgoing'}`}
                >
                  {message.content}
                </div>
              );
            })
          ) : (
            <div className="muted">No messages yet. Start the conversation.</div>
          )}
        </div>

        <div className="composer-row">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
          />
          <button className="button primary small" onClick={send}>
            Send
          </button>
        </div>
      </>
    );
  }, [activeMatch, messages, text, loadingMessages]);

  return (
    <AppShell>
      <div className="stack gap16">
        <div className="soft-card">
          <div className="row between center match-page-head">
            <div>
              <h1 className="page-title">Connections</h1>
              <div className="muted small-text">
                Manage likes, matches, and conversations.
              </div>
            </div>
          </div>

          <div className="matches-tabs top16">
            <button
              className={`matches-tab ${activeTab === TABS.LIKED_YOU ? 'active' : ''}`}
              onClick={() => setActiveTab(TABS.LIKED_YOU)}
            >
              Liked You
            </button>
            <button
              className={`matches-tab ${activeTab === TABS.MATCHES ? 'active' : ''}`}
              onClick={() => setActiveTab(TABS.MATCHES)}
            >
              Matches
            </button>
            <button
              className={`matches-tab ${activeTab === TABS.CHATS ? 'active' : ''}`}
              onClick={() => setActiveTab(TABS.CHATS)}
            >
              Chats
            </button>
          </div>
        </div>

        {activeTab === TABS.LIKED_YOU ? (
          <div className="soft-card">{likesList}</div>
        ) : null}

        {activeTab === TABS.MATCHES ? (
          <div className="soft-card">
            <h3 className="section-title">Your Matches</h3>
            {matchesList}
          </div>
        ) : null}

        {activeTab === TABS.CHATS ? (
          <div className="matches-layout">
            <div className="matches-sidebar soft-card">
              <h3>Chats</h3>
              <div className="top12">{matchesList}</div>
            </div>

            <div className="chat-card soft-card">
              {chatPanel}
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
      }
