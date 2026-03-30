import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { PageLoader } from '../components/ui/Loader';
import Avatar from '../components/ui/avatar';
import { formatRelative } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Messages() {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    api.get('/messages/conversations')
      .then(({ data }) => {
        setConversations(data.conversations);
        // If userId param, load that chat
        if (userId) {
          const existing = data.conversations.find((c: any) => c.other_user === userId);
          if (existing) setActiveUser(existing);
          else {
            // Fetch user info for new conversation
            api.get(`/users/${userId}`).then(({ data: ud }) => {
              setActiveUser({ other_user: userId, name: ud.user.name, avatar: ud.user.avatar, college: ud.user.college });
            }).catch(() => navigate('/messages'));
          }
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // Load messages when activeUser changes
  useEffect(() => {
    if (!activeUser) return;
    api.get(`/messages/${activeUser.other_user}`)
      .then(({ data }) => setMessages(data.messages))
      .catch(() => setMessages([]));
  }, [activeUser?.other_user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 5s
  useEffect(() => {
    if (!activeUser) return;
    const interval = setInterval(() => {
      api.get(`/messages/${activeUser.other_user}`)
        .then(({ data }) => setMessages(data.messages));
    }, 5000);
    return () => clearInterval(interval);
  }, [activeUser?.other_user]);

  const selectConversation = (conv: any) => {
    setActiveUser(conv);
    navigate(`/messages/${conv.other_user}`, { replace: true });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !activeUser) return;
    setSending(true);
    try {
      const { data } = await api.post('/messages', {
        receiver_id: activeUser.other_user,
        content: content.trim(),
      });
      setMessages(m => [...m, data.message]);
      setContent('');
      // Update conversation list
      setConversations(prev => {
        const exists = prev.find(c => c.other_user === activeUser.other_user);
        if (exists) {
          return prev.map(c => c.other_user === activeUser.other_user
            ? { ...c, last_message: content.trim(), last_message_at: new Date().toISOString() }
            : c);
        }
        return [{ ...activeUser, last_message: content.trim(), last_message_at: new Date().toISOString() }, ...prev];
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-extrabold text-3xl text-white mb-6">Messages</h1>
      <div className="flex gap-0 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden" style={{ height: '70vh' }}>
        {/* Conversation list */}
        <div className="w-72 shrink-0 border-r border-neutral-800 flex flex-col">
          <div className="p-4 border-b border-neutral-800">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-neutral-600 text-sm">No conversations yet</div>
            ) : conversations.map((c: any) => (
              <button
                key={c.other_user}
                onClick={() => selectConversation(c)}
                className={`w-full flex items-center gap-3 p-3.5 hover:bg-white/5 transition-colors text-left border-b border-neutral-800/50 ${activeUser?.other_user === c.other_user ? 'bg-yellow-400/5 border-l-2 border-l-yellow-400' : ''}`}
              >
                <div className="relative shrink-0">
                  <Avatar user={{ name: c.name, avatar: c.avatar }} size="sm" />
                  {!c.is_read && c.sender_id !== user?.id && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-neutral-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-200 truncate">{c.name}</p>
                  <p className="text-xs text-neutral-600 truncate">{c.last_message}</p>
                </div>
                <span className="text-xs text-neutral-700 shrink-0">{formatRelative(c.last_message_at)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        {!activeUser ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-3 opacity-20">💬</div>
              <p className="text-neutral-600 text-sm">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-800 bg-neutral-900/50">
              <Link to={`/profile/${activeUser.other_user}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Avatar user={{ name: activeUser.name, avatar: activeUser.avatar }} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-neutral-200">{activeUser.name}</p>
                  {activeUser.college && <p className="text-xs text-neutral-600">{activeUser.college}</p>}
                </div>
              </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {messages.length === 0 && (
                <div className="text-center text-neutral-700 text-sm mt-auto mb-4">
                  Start the conversation!
                </div>
              )}
              {messages.map((m: any) => {
                const isMine = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMine && <Avatar user={{ name: m.sender_name }} size="xs" />}
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? 'bg-yellow-400 text-neutral-950 rounded-tr-sm' : 'bg-neutral-800 text-neutral-200 rounded-tl-sm'}`}>
                      {m.content}
                      <div className={`text-xs mt-1 ${isMine ? 'text-neutral-700' : 'text-neutral-600'}`}>
                        {formatRelative(m.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex gap-3 p-4 border-t border-neutral-800">
              <input
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={`Message ${activeUser.name}...`}
                className="flex-1 bg-neutral-800 border border-neutral-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!content.trim() || sending}
                className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0"
              >
                {sending ? '...' : 'Send'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}