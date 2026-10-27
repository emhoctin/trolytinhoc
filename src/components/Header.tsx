import React from 'react';
import { BookOpen, ShieldCheck, Sparkles, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  onReset: () => void;
  hasActiveSession: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide, onReset, hasActiveSession }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400 font-bold text-lg">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Cố vấn Lập trình Tin học 10 <span className="text-amber-400 font-black">Socratic</span>
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Thonny & IDLE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Phương pháp vấn đáp Socratic • GDPT 2018 • Tự khám phá và làm chủ tư duy gỡ lỗi Python
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Nguyên tắc: Tuyệt đối không viết code hộ</span>
          </div>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            title="Tra cứu các loại lỗi và khái niệm Tin học 10"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cẩm nang Lỗi Tin 10</span>
          </button>

          {hasActiveSession && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition"
              title="Làm mới phiên tư vấn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Gỡ lỗi mới</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
