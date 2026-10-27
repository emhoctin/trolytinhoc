import React, { useState } from 'react';
import { 
  AlertCircle, 
  Lightbulb, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Send, 
  CheckCircle2, 
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Trophy
} from 'lucide-react';
import { CelebrationModal } from './CelebrationModal';

interface SocraticCardViewProps {
  errorLocation: string;
  errorType: string;
  conceptExplanation: string;
  socraticQuestion: string;
  fullMarkdown?: string;
  onSendStudentReply: (replyText: string) => void;
  isLoadingReply: boolean;
  onContinueNew?: () => void;
  onResolved?: () => void;
}

export const SocraticCardView: React.FC<SocraticCardViewProps> = ({
  errorLocation,
  errorType,
  conceptExplanation,
  socraticQuestion,
  fullMarkdown,
  onSendStudentReply,
  isLoadingReply,
  onContinueNew,
  onResolved,
}) => {
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Web Speech API for reading the Socratic question in Vietnamese
  const handleReadQuestion = () => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ tính năng đọc âm thanh.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = socraticQuestion || 'Em hãy đọc kỹ câu hỏi gợi mở để tìm ra nguyên nhân.';
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;

    // Pick Vietnamese voice if available
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VN'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim() || isLoadingReply) return;
    onSendStudentReply(studentAnswer);
    setStudentAnswer('');
  };

  const quickReplies = [
    'Em nghĩ ở cuối dòng đó còn thiếu một ký tự đặc biệt...',
    'Có phải do kiểu dữ liệu trả về từ input() chưa được ép kiểu không thầy?',
    'Khối lệnh con này em quên thụt lề 4 dấu cách ạ?',
    'Phép so sánh trong điều kiện if phải dùng 2 dấu bằng (==) đúng không ạ?',
  ];

  return (
    <div className="space-y-4">
      {/* Principle Banner */}
      <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold">
            Quy trình Socratic 3 bước: Xác định lỗi → Hiểu khái niệm → Tự suy ngẫm sửa lỗi
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] text-slate-400">
          Tuyệt đối không viết code hộ
        </span>
      </div>

      {/* STEP 1: Xác định lỗi */}
      <div className="rounded-2xl bg-slate-900/90 border border-rose-500/30 p-5 shadow-lg shadow-rose-950/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
              1
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Bước 1: Xác định lỗi
            </h3>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
            Chỉ điểm dòng & loại lỗi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Vị trí dòng lỗi trong mã nguồn:</span>
            <div className="text-sm font-bold text-rose-400 font-mono flex items-center gap-1.5">
              <span>📍 {errorLocation || 'Phát hiện trong mã nguồn'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Tên & Phân loại lỗi Python:</span>
            <div className="text-sm font-bold text-amber-300 font-mono flex items-center gap-1.5">
              <span>⚠️ {errorType || 'Lỗi lập trình'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: Giải thích khái niệm Tin học 10 */}
      <div className="rounded-2xl bg-slate-900/90 border border-indigo-500/30 p-5 shadow-lg shadow-indigo-950/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              2
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-indigo-400" />
              Bước 2: Giải thích khái niệm Tin học 10
            </h3>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            Kiến thức nền tảng SGK
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-200 text-xs sm:text-sm leading-relaxed">
          {conceptExplanation ? (
            <p className="whitespace-pre-line">{conceptExplanation}</p>
          ) : (
            <div className="text-slate-400 italic">
              Đang phân tích khái niệm liên quan đến cấu trúc lệnh này...
            </div>
          )}
        </div>
      </div>

      {/* STEP 3: Câu hỏi gợi mở Socratic */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/50 p-5 sm:p-6 shadow-xl shadow-amber-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-500/30 text-amber-300 flex items-center justify-center font-extrabold text-sm shadow-sm">
              3
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Bước 3: Câu hỏi gợi mở (Socratic)
            </h3>
          </div>

          <button
            type="button"
            onClick={handleReadQuestion}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              isPlayingAudio
                ? 'bg-amber-500 text-slate-950'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
            title="Đọc câu hỏi bằng giọng nói tiếng Việt"
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {isPlayingAudio ? 'Dừng đọc' : 'Nghe câu hỏi'}
            </span>
          </button>
        </div>

        {/* The Single Socratic Question Box */}
        <div className="my-3 p-4 rounded-xl bg-slate-950/90 border border-amber-500/40 text-amber-100 font-medium text-sm sm:text-base leading-relaxed flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
              Câu hỏi để em tự gỡ lỗi:
            </div>
            <p className="text-amber-200 font-medium">
              "{socraticQuestion || 'Quan sát vị trí được chỉ điểm ở trên, em thấy câu lệnh đang thiếu quy tắc cú pháp nào?'}"
            </p>
          </div>
        </div>

        {/* Student reasoning interaction */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Em hãy suy nghĩ và trả lời câu hỏi của Cố vấn để cùng tìm ra hướng sửa:</span>
          </label>

          {/* Quick suggestion pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {quickReplies.map((pill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setStudentAnswer(pill)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 transition text-left"
              >
                {pill}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Nhập câu trả lời hoặc suy nghĩ của em tại đây..."
              disabled={isLoadingReply}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!studentAnswer.trim() || isLoadingReply}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition shadow-lg shadow-amber-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingReply ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  <span>Gửi</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Prominent Victory Action: Tôi đã sửa được lỗi! */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            setShowCelebration(true);
            onResolved?.();
          }}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/40 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer border border-emerald-400/50 group"
        >
          <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
          <span>🎉 Tôi đã sửa được lỗi!</span>
          <CheckCircle2 className="w-5 h-5 text-slate-950 fill-emerald-200" />
        </button>
      </div>

      {/* Celebration Modal with Confetti and Summary */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        errorLocation={errorLocation}
        errorType={errorType}
        conceptExplanation={conceptExplanation}
        socraticQuestion={socraticQuestion}
        onContinueNew={() => {
          setShowCelebration(false);
          if (onContinueNew) {
            onContinueNew();
          }
        }}
      />
    </div>
  );
};
