import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MessageBubble({ message, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        message.role === 'user' 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
          : 'bg-slate-800/50 backdrop-blur-sm text-slate-100 border border-slate-700/50'
      }`}>
        {message.role === 'user' ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown 
            className="text-sm prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              code: ({ inline, children }) => 
                inline ? (
                  <code className="px-1.5 py-0.5 rounded bg-slate-700 text-blue-300 text-xs font-mono">
                    {children}
                  </code>
                ) : (
                  <code className="block bg-slate-900 text-blue-300 p-3 rounded-lg my-2 text-xs font-mono overflow-x-auto">
                    {children}
                  </code>
                ),
              strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
      
      {message.role === 'user' && (
        <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
          <div className="w-5 h-5 bg-slate-500 rounded-full" />
        </div>
      )}
    </motion.div>
  );
}
