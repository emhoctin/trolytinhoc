import React, { useState } from 'react';
import { X, BookOpen, AlertTriangle, Lightbulb, Search, BookMarked, Terminal } from 'lucide-react';
import { TIN_HOC_10_ERROR_TYPES } from '../data/tinHoc10Guide';

interface SocraticHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectErrorType?: (errorType: string) => void;
}

export const SocraticHandbookModal: React.FC<SocraticHandbookModalProps> = ({
  isOpen,
  onClose,
  onSelectErrorType,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredErrors = TIN_HOC_10_ERROR_TYPES.filter(
    (err) =>
      err.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      err.vietnameseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      err.curriculumLesson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Cẩm nang Nhận biết Lỗi Python — Tin học 10
              </h2>
              <p className="text-xs text-slate-400">
                Theo chương trình GDPT 2018 (Bài 17 - 29: Các dạng lỗi cú pháp, ngoại lệ và logic)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar & Socratic reminder */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm loại lỗi (Syntax, Indent...)"
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Phương châm: Hiểu bản chất khái niệm để tự khắc phục lỗi triệt để</span>
          </div>
        </div>

        {/* Modal Body / Error List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredErrors.map((err) => (
            <div
              key={err.type}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${err.badgeColor}`}
                  >
                    {err.type}
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {err.vietnameseName}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <BookMarked className="w-3 h-3 text-indigo-400" />
                  {err.curriculumLesson}
                </span>
              </div>

              <div className="text-xs text-slate-300 mb-3 space-y-1.5">
                <p>
                  <strong className="text-slate-400">Nguyên nhân:</strong> {err.commonCause}
                </p>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800 font-mono text-[11px] text-amber-300">
                  <span className="text-slate-500 text-[10px] block font-sans">Ví dụ thường gặp:</span>
                  {err.example}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-indigo-200">
                  <span className="font-semibold text-indigo-100">Gợi mở Socratic: </span>
                  {err.socraticHint}
                </div>
              </div>
            </div>
          ))}

          {filteredErrors.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              Không tìm thấy loại lỗi phù hợp với từ khóa "{searchTerm}".
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Mẹo Thonny: Nhấn F5 để chạy chương trình, F7 để gỡ lỗi từng bước</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
