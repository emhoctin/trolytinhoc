import React from 'react';
import { User, Sparkles, ShieldCheck } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface ChatThreadProps {
  messages: ChatMessage[];
}

export const ChatThread: React.FC<ChatThreadProps> = ({ messages }) => {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-slate-800">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-slate-300">Nhật ký trao đổi Socratic:</span>
        <span className="flex items-center gap-1 text-[11px] text-amber-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Luôn giữ nguyên tắc không viết hộ code
        </span>
      </div>

      <div className="space-y-3">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-700/80 text-slate-100 rounded-tl-none'
                }`}
              >
                <div className="text-[10px] font-semibold opacity-75 mb-1 flex items-center justify-between gap-4">
                  <span>{isUser ? 'Học sinh' : 'Cố vấn Socratic'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="whitespace-pre-line">{msg.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
