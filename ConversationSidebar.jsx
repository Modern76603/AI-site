import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, Search, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ConversationSidebar({ 
  conversations, 
  currentConversation, 
  onSelectConversation, 
  onNewConversation,
  onDeleteConversation 
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const name = conv.metadata?.name || 'New Chat';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-80 bg-slate-900/50 backdrop-blur-sm border-r border-slate-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <Button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4 space-y-1">
          <AnimatePresence>
            {filteredConversations.map((conv) => {
              const isActive = currentConversation?.id === conv.id;
              const name = conv.metadata?.name || 'New Chat';
              const date = conv.created_date ? format(new Date(conv.created_date), 'MMM d, yyyy') : '';

              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectConversation(conv)}
                      className={`flex-1 flex items-start gap-3 p-3 rounded-lg transition-all ${
                        isActive 
                          ? 'bg-slate-800 border border-blue-500/50' 
                          : 'hover:bg-slate-800/50 border border-transparent'
                      }`}
                    >
                      <MessageSquare className={`w-4 h-4 mt-1 flex-shrink-0 ${
                        isActive ? 'text-blue-400' : 'text-slate-500'
                      }`} />
                      <div className="flex-1 text-left overflow-hidden">
                        <p className={`text-sm font-medium truncate ${
                          isActive ? 'text-white' : 'text-slate-300'
                        }`}>
                          {name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{date}</p>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-slate-500 hover:text-red-400"
                      onClick={() => onDeleteConversation(conv.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredConversations.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
