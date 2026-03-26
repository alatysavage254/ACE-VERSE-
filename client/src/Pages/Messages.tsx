import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { getConversations, getMessages, sendMessage, type Conversation, type Message } from '../services/messages.service';
import { Send } from 'lucide-react';

export const Messages = () => {
  const { user } = useAuthContext();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Handle starting a new conversation from profile
  useEffect(() => {
    if (location.state?.startConversationWith) {
      const newUser = location.state.startConversationWith;
      // Create a temporary conversation object
      const tempConversation: Conversation = {
        user: {
          _id: newUser._id,
          username: newUser.username,
          photoURL: newUser.photoURL
        },
        lastMessage: { content: '', createdAt: new Date().toISOString() } as any,
        unreadCount: 0
      };
      setSelectedConversation(tempConversation);
      setMessages([]);
    }
  }, [location.state]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (userId: string) => {
    setLoading(true);
    try {
      const data = await getMessages(userId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const newMessage = await sendMessage(selectedConversation.user._id, messageText);
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
      // Refresh conversations to show the new conversation
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Please log in to view messages</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-cyber-black">
      {/* Conversations List */}
      <div className="w-80 border-r border-white/10 bg-cyber-dark/40">
        <div className="border-b border-white/10 p-4">
          <h2 className="text-xl font-bold text-slate-100">Messages</h2>
        </div>
        <div className="overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <motion.button
                key={conv.user._id}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                onClick={() => setSelectedConversation(conv)}
                className={`flex w-full items-center gap-3 border-b border-white/5 p-4 text-left transition-colors ${
                  selectedConversation?.user._id === conv.user._id ? 'bg-white/10' : ''
                }`}
              >
                <img
                  src={conv.user.photoURL}
                  alt={conv.user.username}
                  className="h-12 w-12 rounded-full border-2 border-neon-violet/50 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-100">@{conv.user.username}</span>
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neon-pink text-xs font-bold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-400">{conv.lastMessage.content}</p>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-cyber-dark/40 p-4">
              <img
                src={selectedConversation.user.photoURL}
                alt={selectedConversation.user.username}
                className="h-10 w-10 rounded-full border-2 border-neon-violet/50 object-cover"
              />
              <span className="text-lg font-semibold text-slate-100">@{selectedConversation.user.username}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-neon-indigo/30 border-t-neon-indigo"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isOwn = msg.senderId._id === user._id || msg.senderId._id === user.uid;
                    return (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-gradient-to-r from-neon-indigo to-neon-cyan text-white'
                                : 'bg-white/10 text-slate-100'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-white/10 bg-cyber-dark/40 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none backdrop-blur-sm transition-all focus:border-neon-indigo/50 focus:bg-white/10 focus:ring-2 focus:ring-neon-indigo/20 disabled:opacity-40"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="rounded-xl bg-gradient-to-r from-neon-indigo to-neon-cyan p-3 text-white shadow-glow-md shadow-neon-indigo/50 transition-all hover:shadow-glow-lg disabled:opacity-40 disabled:shadow-none"
                >
                  <Send size={20} />
                </motion.button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="mt-4 text-slate-400">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
