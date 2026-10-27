import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  Image as ImageIcon, 
  Code2, 
  Bookmark, 
  Send, 
  RotateCcw, 
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  FileText,
  ChevronRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { Header } from './components/Header';
import { SocraticHandbookModal } from './components/SocraticHandbookModal';
import { ThonnyCodeViewer } from './components/ThonnyCodeViewer';
import { SocraticCardView } from './components/SocraticCardView';
import { SocraticStepIndicator } from './components/SocraticStepIndicator';
import { ImageUploader } from './components/ImageUploader';
import { ChatThread, ChatMessage } from './components/ChatThread';
import { SAMPLE_ERROR_CASES, SampleErrorCase } from './data/sampleErrors';

interface SocraticAnalysisResult {
  errorLocation: string;
  errorType: string;
  conceptExplanation: string;
  socraticQuestion: string;
  highlightedLine?: number | null;
  detectedCodeSnippet?: string;
  fullMessageMarkdown?: string;
}

export default function App() {
  // Input states
  const [activeInputTab, setActiveInputTab] = useState<'screenshot' | 'code' | 'samples'>('screenshot');
  const [studentCode, setStudentCode] = useState<string>('');
  const [errorTraceback, setErrorTraceback] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/png');
  const [imageFileName, setImageFileName] = useState<string>('');

  // Results & Conversation state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingReply, setIsLoadingReply] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SocraticAnalysisResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isResolved, setIsResolved] = useState<boolean>(false);

  // Handbook modal
  const [isHandbookOpen, setIsHandbookOpen] = useState<boolean>(false);

  // Handle image selected
  const handleImageSelected = (base64: string, mimeType: string, fileName?: string) => {
    setImageBase64(base64);
    setImageMimeType(mimeType);
    setImageFileName(fileName || 'screenshot.png');
    setErrorMessage(null);
  };

  // Clear image
  const handleClearImage = () => {
    setImageBase64(null);
    setImageFileName('');
  };

  // Load sample case
  const handleSelectSample = (sample: SampleErrorCase) => {
    setStudentCode(sample.code);
    setErrorTraceback(sample.errorText);
    setImageBase64(null);
    setActiveInputTab('code');
  };

  // Reset all
  const handleReset = () => {
    setAnalysisResult(null);
    setChatMessages([]);
    setErrorMessage(null);
    setStudentCode('');
    setErrorTraceback('');
    setImageBase64(null);
    setImageFileName('');
    setIsResolved(false);
  };

  // Perform initial Socratic Analysis
  const handleAnalyze = async () => {
    if (!imageBase64 && !studentCode.trim() && !errorTraceback.trim()) {
      setErrorMessage('Em hãy tải ảnh chụp Thonny/IDLE hoặc dán mã code và thông báo lỗi để Cố vấn bắt đầu phân tích nhé.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/socratic/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: studentCode,
          errorText: errorTraceback,
          imageBase64: imageBase64,
          imageMimeType: imageMimeType,
          conversationHistory: [],
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Có lỗi khi phân tích.');
      }

      const result: SocraticAnalysisResult = resData.data;
      setAnalysisResult(result);

      // If code was detected from image or provided
      if (result.detectedCodeSnippet && !studentCode.trim()) {
        setStudentCode(result.detectedCodeSnippet);
      }

      // Add to chat history
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages([
        {
          id: 'initial-coach',
          role: 'model',
          text: `📍 ${result.errorLocation} • ${result.errorType}\n\n💡 ${result.conceptExplanation}\n\n❓ Câu hỏi gợi mở: "${result.socraticQuestion}"`,
          timestamp: now,
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Không thể kết nối với máy chủ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Student replies to Socratic question
  const handleStudentReply = async (replyText: string) => {
    if (!replyText.trim() || isLoadingReply) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: replyText,
      timestamp: now,
    };

    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setIsLoadingReply(true);

    try {
      const response = await fetch('/api/socratic/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: studentCode,
          errorText: errorTraceback,
          imageBase64: imageBase64,
          imageMimeType: imageMimeType,
          studentMessage: replyText,
          conversationHistory: newMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Có lỗi phản hồi.');
      }

      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        role: 'model',
        text: resData.data.fullMessageMarkdown || resData.data.socraticQuestion || 'Thầy/Cô ghi nhận ý kiến của em.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Không thể gửi câu trả lời. Vui lòng thử lại.');
    } finally {
      setIsLoadingReply(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        onOpenGuide={() => setIsHandbookOpen(true)}
        onReset={handleReset}
        hasActiveSession={Boolean(analysisResult || studentCode || imageBase64)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Intro Banner for Socratic Philosophy */}
        <section className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-amber-950/40 border border-slate-800 p-4 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Phương pháp Socratic 3 bước: Xác định lỗi → Khái niệm Tin 10 → Câu hỏi gợi mở</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Gặp lỗi khi chạy chương trình Thonny hay IDLE?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Đừng lo lắng! Hãy chụp ảnh màn hình máy tính hoặc dán code báo lỗi vào đây. 
                Cố vấn sẽ <strong className="text-amber-400 font-semibold">không giải hộ code</strong>, 
                mà sẽ chỉ điểm vị trí, nhắc lại khái niệm trong SGK Tin học 10 và đặt câu hỏi gợi mở để <strong className="text-indigo-300 font-semibold">chính em tự gỡ được lỗi</strong>!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsHandbookOpen(true)}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition shadow-lg shadow-indigo-950/50 flex items-center gap-2 self-start md:self-auto"
            >
              <Bookmark className="w-4 h-4" />
              <span>Xem 7 dạng lỗi SGK Tin 10</span>
            </button>
          </div>
        </section>

        {/* INPUT WORKSPACE (If no analysis yet, or collapsible) */}
        {!analysisResult && (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-4 sm:p-6 space-y-5">
            {/* Tab switchers */}
            <div className="flex border-b border-slate-800 pb-3 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveInputTab('screenshot')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeInputTab === 'screenshot'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>1. Tải ảnh chụp Thonny / IDLE</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputTab('code')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeInputTab === 'code'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>2. Dán mã nguồn & Shell lỗi</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputTab('samples')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeInputTab === 'samples'
                    ? 'bg-amber-600/90 text-white shadow-md shadow-amber-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>3. Thử lỗi mẫu Tin 10 (Ví dụ nhanh)</span>
              </button>
            </div>

            {/* TAB 1: Screenshot Upload */}
            {activeInputTab === 'screenshot' && (
              <div className="space-y-4">
                <ImageUploader
                  imagePreview={imageBase64}
                  onImageSelected={handleImageSelected}
                  onClearImage={handleClearImage}
                />

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">Mẹo cho học sinh:</strong> Trên máy tính phòng thực hành, em có thể nhấn tổ hợp phím{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px]">
                      Windows + Shift + S
                    </kbd>{' '}
                    để khoanh vùng chụp lại cửa sổ Thonny (bao gồm cả dòng code và cửa sổ Shell/Assistant báo lỗi màu đỏ), sau đó quay lại trang này và nhấn{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px]">
                      Ctrl + V
                    </kbd>{' '}
                    để dán ngay lập tức!
                  </div>
                </div>

                {/* Optional note or error text alongside image */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ghi chú thêm về bài toán hoặc lỗi em đang gặp (tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={errorTraceback}
                    onChange={(e) => setErrorTraceback(e.target.value)}
                    placeholder="Ví dụ: Em đang làm bài 20 tính tổng mà bấm F5 máy báo lỗi đỏ ở góc dưới Thonny..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Direct Code & Traceback */}
            {activeInputTab === 'code' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      Mã nguồn Python của em (trong Thonny / IDLE):
                    </span>
                    <span className="text-[11px] text-slate-500">Hỗ trợ phím Tab để thụt dòng</span>
                  </label>
                  <textarea
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder={`# Dán code chương trình Python của em vào đây...\nfor i in range(5)\n    print(i)`}
                    rows={9}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    spellCheck={false}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-rose-400" />
                    Thông báo lỗi xuất hiện trong Shell / Terminal:
                  </label>
                  <textarea
                    value={errorTraceback}
                    onChange={(e) => setErrorTraceback(e.target.value)}
                    placeholder={`SyntaxError: expected ':'\nhoặc\nTraceback (most recent call last):\n  File "main.py", line 4, in <module>\nTypeError: can only concatenate str (not "int") to str`}
                    rows={9}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm font-mono text-rose-300 placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Samples Library */}
            {activeInputTab === 'samples' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">
                  Chọn một trường hợp lỗi điển hình trong SGK Tin học 10 để xem cách Cố vấn Socratic hướng dẫn:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SAMPLE_ERROR_CASES.map((sample) => (
                    <div
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-950 transition cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                            {sample.errorType}
                          </span>
                          <span className="text-[10px] text-slate-500">{sample.lesson}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition">
                          {sample.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {sample.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-400 font-semibold">
                        <span>Thử phân tích mẫu này</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Analyze Trigger Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Cố vấn phân tích theo chuẩn 3 bước GDPT 2018</span>
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-400 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Đang quan sát và phân tích Thonny/IDLE...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Bắt đầu Cố vấn Gỡ lỗi Socratic</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* LOADING ANIMATION STATE */}
        {isLoading && (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Cố vấn Socratic đang phân tích chương trình...
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Đang quét cấu trúc code, xác định vị trí dòng lỗi, tra cứu khái niệm Tin học 10 và biên soạn 1 câu hỏi gợi mở dành riêng cho em.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Đang tuân thủ quy tắc: Không viết code hộ học sinh</span>
            </div>
          </div>
        )}

        {/* SOCRATIC RESULTS VIEW (When analysis is completed) */}
        {analysisResult && !isLoading && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top action bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs sm:text-sm font-bold text-white">
                  Phiên cố vấn gỡ lỗi đang diễn ra
                </span>
                <span className="text-xs text-slate-400">• Thonny / IDLE Python 10</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Gỡ bài khác</span>
                </button>
              </div>
            </div>

            {/* Split Screen: Thonny Code Workbench (Left) & Socratic 3-Step Guidance (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (5 cols): Thonny Editor & Screenshot Preview */}
              <div className="lg:col-span-5 space-y-4">
                {/* Thonny IDE Simulation Editor */}
                <ThonnyCodeViewer
                  code={studentCode || analysisResult.detectedCodeSnippet || '# Chưa phát hiện được code'}
                  highlightedLine={analysisResult.highlightedLine}
                  errorType={analysisResult.errorType}
                  onCodeChange={(newCode) => setStudentCode(newCode)}
                />

                {/* Uploaded Screenshot if present */}
                {imageBase64 && (
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                        Ảnh chụp màn hình của em:
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono truncate max-w-[140px]">
                        {imageFileName}
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-slate-900 max-h-60 overflow-auto border border-slate-800">
                      <img
                        src={imageBase64}
                        alt="Ảnh lỗi Thonny"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Shell error message box */}
                {errorTraceback && (
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3">
                    <div className="text-xs font-mono text-rose-400 font-semibold mb-1 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      Thông báo lỗi từ Shell:
                    </div>
                    <pre className="text-[11px] font-mono text-rose-300/90 whitespace-pre-wrap bg-slate-900 p-2.5 rounded-lg overflow-x-auto max-h-40 border border-rose-950/40">
                      {errorTraceback}
                    </pre>
                  </div>
                )}
              </div>

              {/* Right Column (7 cols): Socratic 3 Steps, Progress Tracker & Conversation */}
              <div className="lg:col-span-7 space-y-4">
                {/* Visual Socratic Step Indicator */}
                <SocraticStepIndicator
                  currentStep={isResolved ? 5 : (chatMessages.filter((m) => m.role === 'user').length > 0 ? 4 : 3)}
                  attemptsCount={chatMessages.filter((m) => m.role === 'user').length}
                  isResolved={isResolved}
                />

                <SocraticCardView
                  errorLocation={analysisResult.errorLocation}
                  errorType={analysisResult.errorType}
                  conceptExplanation={analysisResult.conceptExplanation}
                  socraticQuestion={analysisResult.socraticQuestion}
                  fullMarkdown={analysisResult.fullMessageMarkdown}
                  onSendStudentReply={handleStudentReply}
                  isLoadingReply={isLoadingReply}
                  onContinueNew={handleReset}
                  onResolved={() => setIsResolved(true)}
                />

                {/* Multi-turn Chat Thread */}
                {chatMessages.length > 1 && (
                  <ChatThread messages={chatMessages.slice(1)} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Socratic Handbook Modal */}
      <SocraticHandbookModal
        isOpen={isHandbookOpen}
        onClose={() => setIsHandbookOpen(false)}
        onSelectErrorType={(type) => {
          setIsHandbookOpen(false);
          const found = SAMPLE_ERROR_CASES.find((s) => s.errorType.toLowerCase() === type.toLowerCase());
          if (found) {
            handleSelectSample(found);
          }
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>
          Cố vấn Lập trình Tin học 10 Socratic • Xây dựng cho giáo dục phổ thông Việt Nam (Chương trình GDPT 2018)
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Hỗ trợ môi trường học tập Thonny IDE & IDLE • Khuyến khích tư duy phản biện và tự sửa lỗi
        </p>
      </footer>
    </div>
  );
}
