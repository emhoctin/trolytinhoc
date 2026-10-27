import React, { useState } from 'react';
import { Play, Bug, Square, Copy, Check, Terminal, Edit3, Eye, Sparkles, CheckCircle2 } from 'lucide-react';

interface ThonnyCodeViewerProps {
  code: string;
  highlightedLine?: number | null;
  errorType?: string;
  onCodeChange?: (newCode: string) => void;
  readOnly?: boolean;
}

export const ThonnyCodeViewer: React.FC<ThonnyCodeViewerProps> = ({
  code,
  highlightedLine,
  errorType,
  onCodeChange,
  readOnly = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'warning'; message: string }>({
    status: 'idle',
    message: '',
  });

  const lines = code ? code.split('\n') : ['# Chưa có mã nguồn'];

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Student quick syntax check simulation
  const handleQuickSyntaxCheck = () => {
    if (!code.trim()) {
      setTestResult({ status: 'warning', message: 'Mã nguồn đang trống!' });
      return;
    }

    const currentLines = code.split('\n');
    let issues: string[] = [];

    currentLines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Check missing colon on control statements
      if (
        (trimmed.startsWith('for ') ||
          trimmed.startsWith('if ') ||
          trimmed.startsWith('elif ') ||
          trimmed.startsWith('else:') === false && trimmed.startsWith('else') ||
          trimmed.startsWith('while ') ||
          trimmed.startsWith('def ')) &&
        !trimmed.endsWith(':') &&
        !trimmed.includes('#')
      ) {
        issues.push(`Dòng ${lineNum}: Câu lệnh cấu trúc đang thiếu dấu hai chấm ':' ở cuối.`);
      }

      // Check single equal sign inside if condition
      if (
        trimmed.startsWith('if ') &&
        !trimmed.includes('==') &&
        !trimmed.includes('!=') &&
        !trimmed.includes('<=') &&
        !trimmed.includes('>=') &&
        trimmed.includes('=') &&
        !trimmed.includes(' in ')
      ) {
        issues.push(`Dòng ${lineNum}: Phép so sánh bằng trong 'if' cần dùng hai dấu bằng '==' thay vì một dấu '='.`);
      }
    });

    if (issues.length === 0) {
      setTestResult({
        status: 'success',
        message: 'Tuyệt vời! Không phát hiện lỗi cú pháp cơ bản như thiếu ":" hay nhầm "=" nữa. Em hãy chạy thử lại trong Thonny nhé!',
      });
    } else {
      setTestResult({
        status: 'warning',
        message: issues[0],
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enable Tab key indent in textarea
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      if (onCodeChange) {
        onCodeChange(newValue);
      }
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
      {/* Thonny IDE Window Titlebar */}
      <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <span className="px-2.5 py-1 rounded bg-slate-950 text-xs font-mono text-indigo-300 font-medium flex items-center gap-1.5 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              chuong_trinh.py
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Trình soạn thảo Thonny IDE
            </span>
          </div>
        </div>

        {/* Thonny Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {!readOnly && (
            <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex items-center text-xs mr-2">
              <button
                type="button"
                onClick={() => setActiveTab('view')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                  activeTab === 'view'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">Chỉ điểm lỗi</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                  activeTab === 'edit'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Thử sửa code</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Sao chép code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Thonny IDE Toolbar Mock */}
      <div className="bg-slate-900/60 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition cursor-pointer">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="text-[11px] font-medium hidden sm:inline">Run (F5)</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400/80 hover:text-amber-300 transition cursor-pointer">
            <Bug className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Debug (F7)</span>
          </div>
          <div className="flex items-center gap-1 text-rose-400/80 hover:text-rose-300 transition cursor-pointer">
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="text-[11px] font-medium hidden sm:inline">Stop</span>
          </div>
        </div>

        {highlightedLine && activeTab === 'view' && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Phát hiện nghi vấn tại <strong>Dòng {highlightedLine}</strong></span>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="relative font-mono text-xs sm:text-sm overflow-x-auto min-h-[160px] max-h-[380px] bg-slate-950">
        {activeTab === 'view' ? (
          <div className="py-2.5">
            {lines.map((lineContent, idx) => {
              const lineNum = idx + 1;
              const isErrorLine = highlightedLine === lineNum;
              return (
                <div
                  key={lineNum}
                  className={`flex items-start transition-colors px-3 py-0.5 group ${
                    isErrorLine
                      ? 'bg-rose-950/40 border-l-4 border-rose-500 text-rose-200'
                      : 'hover:bg-slate-900/40 text-slate-300'
                  }`}
                >
                  {/* Line Number */}
                  <span
                    className={`w-9 shrink-0 text-right pr-3 select-none text-[11px] ${
                      isErrorLine
                        ? 'font-bold text-rose-400'
                        : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  >
                    {lineNum}
                  </span>

                  {/* Code Line Content */}
                  <div className="flex-1 whitespace-pre overflow-x-visible flex items-center gap-2">
                    <span>{lineContent || ' '}</span>
                    {isErrorLine && (
                      <span className="inline-flex items-center gap-1 ml-3 px-2 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-sans font-semibold animate-pulse select-none">
                        📍 Vị trí lỗi ({errorType || 'Cần kiểm tra'})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3">
            <textarea
              value={code}
              onChange={(e) => onCodeChange && onCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Gõ code hoặc sửa thử tại đây (hỗ trợ phím Tab để thụt dòng)..."
              rows={Math.max(lines.length + 2, 7)}
              className="w-full bg-slate-900/60 text-slate-100 p-3 rounded-xl border border-slate-700 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Editor Footer / Quick Validator */}
      <div className="bg-slate-900/80 px-4 py-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          <span>Python 3.10 • Thonny Shell</span>
        </div>

        {activeTab === 'edit' && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleQuickSyntaxCheck}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition shadow-sm shadow-emerald-900/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kiểm tra cú pháp thử</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Test Feedback Alert */}
      {testResult.status !== 'idle' && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between border-t ${
            testResult.status === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
              : 'bg-amber-950/40 border-amber-800/40 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult.status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Bug className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
          <button
            onClick={() => setTestResult({ status: 'idle', message: '' })}
            className="text-[10px] underline ml-2 hover:text-white"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};
