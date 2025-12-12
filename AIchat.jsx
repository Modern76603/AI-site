import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Loader2, Menu, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConversationSidebar from '../components/chat/ConversationSidebar';
import MessageBubble from '../components/chat/MessageBubble';

export default function AIChat() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    initializeChat();
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      const convList = await base44.agents.listConversations({
        agent_name: 'ai_chat_assistant'
      });
      
      setConversations(convList);

      if (convList.length > 0) {
        await loadConversation(convList[0]);
      } else {
        await createNewConversation();
      }
    } catch (error) {
      toast.error('Failed to load conversations');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (conv) => {
    try {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      const fullConv = await base44.agents.getConversation(conv.id);
      setCurrentConversation(fullConv);
      setMessages(fullConv.messages || []);

      unsubscribeRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages);
      });
    } catch (error) {
      toast.error('Failed to load conversation');
      console.error(error);
    }
  };

  const createNewConversation = async () => {
    try {
      const newConv = await base44.agents.createConversation({
        agent_name: 'ai_chat_assistant',
        metadata: {
          name: 'New Chat',
        }
      });

      setConversations(prev => [newConv, ...prev]);
      await loadConversation(newConv);
    } catch (error) {
      toast.error('Failed to create conversation');
      console.error(error);
    }
  };

  const updateConversationName = async (firstMessage) => {
    if (!currentConversation) return;
    
    try {
      const name = firstMessage.length > 50 
        ? firstMessage.substring(0, 50) + '...' 
        : firstMessage;
      
      await base44.agents.updateConversation(currentConversation.id, {
        metadata: { name }
      });

      setConversations(prev => 
        prev.map(c => c.id === currentConversation.id 
          ? { ...c, metadata: { ...c.metadata, name } }
          : c
        )
      );
    } catch (error) {
      console.error('Failed to update conversation name:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isSending || !currentConversation) return;

    const userMessage = input;
    setInput('');
    setIsSending(true);

    try {
      // Update conversation name with first message
      if (messages.length === 0) {
        await updateConversationName(userMessage);
      }

      await base44.agents.addMessage(currentConversation, {
        role: 'user',
        content: userMessage
      });
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      // Note: Assuming there's a delete method, otherwise we'd mark as deleted
      // For now, just filter it out locally
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        if (remaining.length > 0) {
          await loadConversation(remaining[0]);
        } else {
          await createNewConversation();
        }
      }
      
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <ConversationSidebar
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={loadConversation}
          onNewConversation={createNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="px-6 py-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Chat Assistant</h1>
              <p className="text-sm text-slate-400">
                {currentConversation?.metadata?.name || 'New Chat'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Start a conversation</h2>
                <p className="text-slate-400">Ask me anything and I'll help you out!</p>
              </div>
            )}

            <AnimatePresence>
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} index={index} />
              ))}
            </AnimatePresence>

            {isSending && (
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl px-4 py-3 border border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-sm text-slate-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex gap-3 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="min-h-[60px] max-h-[200px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                disabled={isSending}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-[60px] px-6"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
