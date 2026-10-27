import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Award, 
  Lightbulb, 
  ArrowRight, 
  Flame, 
  Share2 
} from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorLocation: string;
  errorType: string;
  conceptExplanation: string;
  socraticQuestion: string;
  onContinueNew: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  errorLocation,
  errorType,
  conceptExplanation,
  socraticQuestion,
  onContinueNew,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Confetti fireworks burst
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });

      // Gentle victory sound synthesis using Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.1 + 0.5);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + idx * 0.1);
          osc.stop(audioCtx.currentTime + idx * 0.1 + 0.5);
        });
      } catch (e) {
        // Audio synthesis optional
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl shadow-2xl shadow-amber-500/20 flex flex-col overflow-hidden">
        {/* Top Glow & Header */}
        <div className="relative p-6 sm:p-8 text-center pb-4 overflow-hidden border-b border-slate-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/30 mb-3 animate-bounce">
            <Trophy className="w-8 h-8 fill-current" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Thành công gỡ lỗi độc lập!</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Chúc Mừng Em Đã Tự Mình Sửa Được Lỗi! 🎉
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg mx-auto">
            Em đã không cần ai viết hộ code mà tự dựa vào tư duy và kiến thức để làm chủ bài toán.
          </p>
        </div>

        {/* Journey Summary */}
        <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4" />
              Tóm tắt hành trình tư duy của em:
            </h3>

            {/* Step 1 in Summary */}
            <div className="flex items-start gap-3 text-xs">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                1
              </div>
              <div>
                <span className="font-semibold text-slate-200">Điểm xuất phát: </span>
                <span className="text-slate-400">
                  Em đã phát hiện và khoanh vùng được lỗi{' '}
                  <strong className="text-rose-300 font-mono">{errorType}</strong> tại{' '}
                  <strong className="text-rose-300 font-mono">{errorLocation}</strong>.
                </span>
              </div>
            </div>

            {/* Step 2 in Summary */}
            <div className="flex items-start gap-3 text-xs">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                2
              </div>
              <div>
                <span className="font-semibold text-slate-200">Vũ khí kiến thức SGK: </span>
                <span className="text-slate-400">
                  Em đã hiểu rõ bản chất quy tắc Python trong Tin học 10:{' '}
                  <span className="text-indigo-200 italic">"{conceptExplanation || 'Quy chuẩn cú pháp và logic chương trình'}"</span>.
                </span>
              </div>
            </div>

            {/* Step 3 in Summary */}
            <div className="flex items-start gap-3 text-xs">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                3
              </div>
              <div>
                <span className="font-semibold text-slate-200">Bứt phá Socratic: </span>
                <span className="text-slate-400">
                  Trước câu hỏi gợi mở <span className="text-amber-200">"{socraticQuestion}"</span>, 
                  em đã quan sát từng ký tự, tự đặt giả thuyết và tự tay gõ sửa trên Thonny.
                </span>
              </div>
            </div>
          </div>

          {/* Inspirational Note from Socratic Mentor */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-amber-950/30 border border-indigo-500/30 text-xs text-slate-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-200 mb-1">
                Lời nhắn từ Cố vấn Socratic:
              </p>
              <p className="leading-relaxed">
                "Viết code thì dễ, nhưng tự tìm ra chỗ sai và hiểu vì sao nó sai mới là bản lĩnh thực sự của một người học lập trình. Hãy luôn giữ tinh thần tự chủ tư duy này trong mọi bài thực hành Tin học nhé!"
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Xem lại chương trình đã sửa
          </button>

          <button
            type="button"
            onClick={onContinueNew}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-400 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-amber-950/30 flex items-center justify-center gap-2"
          >
            <span>Tự tin gỡ bài tiếp theo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
