import React from 'react';
import { Check, Flame, Award, ArrowRight, Target, Lightbulb, MessageCircle, Code2, Trophy } from 'lucide-react';

export interface SocraticStep {
  id: number;
  title: string;
  shortDesc: string;
  icon: React.ReactNode;
}

interface SocraticStepIndicatorProps {
  currentStep: number; // 1 to 5
  attemptsCount: number; // Number of thinking/reply exchanges
  isResolved: boolean;
}

export const SocraticStepIndicator: React.FC<SocraticStepIndicatorProps> = ({
  currentStep,
  attemptsCount,
  isResolved,
}) => {
  const steps: SocraticStep[] = [
    {
      id: 1,
      title: 'Nhận diện lỗi',
      shortDesc: 'Vị trí & loại lỗi',
      icon: <Target className="w-3.5 h-3.5" />,
    },
    {
      id: 2,
      title: 'Hiểu khái niệm',
      shortDesc: 'Quy tắc Tin 10',
      icon: <Lightbulb className="w-3.5 h-3.5" />,
    },
    {
      id: 3,
      title: 'Suy ngẫm gợi mở',
      shortDesc: 'Đặt giả thuyết',
      icon: <MessageCircle className="w-3.5 h-3.5" />,
    },
    {
      id: 4,
      title: 'Thử sửa code',
      shortDesc: 'Thực nghiệm Thonny',
      icon: <Code2 className="w-3.5 h-3.5" />,
    },
    {
      id: 5,
      title: 'Làm chủ bài toán',
      shortDesc: 'Tự gỡ lỗi xong',
      icon: <Trophy className="w-3.5 h-3.5" />,
    },
  ];

  // Dynamic persistence encouragement message
  const getMotivationalMessage = () => {
    if (isResolved) {
      return 'Xuất sắc! Em đã hoàn thành trọn vẹn 5 bước gỡ lỗi độc lập.';
    }
    if (attemptsCount === 0) {
      return 'Khởi đầu tốt! Đọc kỹ câu hỏi gợi mở và chia sẻ suy nghĩ của em.';
    }
    if (attemptsCount === 1) {
      return 'Rất tốt! Em đang chủ động tư duy và phân tích từng dòng code.';
    }
    if (attemptsCount === 2) {
      return 'Tiếp tục kiên trì! Em đang tiến rất gần đến đáp án đúng rồi.';
    }
    return 'Tinh thần bền bỉ tuyệt vời! Lập trình viên giỏi nhất là người kiên trì gỡ lỗi đến cùng.';
  };

  const activeStep = isResolved ? 5 : currentStep;
  const progressPercent = Math.min(100, Math.max(0, ((activeStep - 1) / (steps.length - 1)) * 100));

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg shadow-slate-950/40 space-y-3.5">
      {/* Top row: Header & Persistence Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <span>Tiến trình giải quyết vấn đề Socratic</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              Bước {activeStep}/5
            </span>
          </h3>
        </div>

        {/* Persistence effort badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400/20" />
            <span>{attemptsCount} lượt suy ngẫm & thử nghiệm</span>
          </div>
        </div>
      </div>

      {/* Visual Stepper Bar */}
      <div className="relative pt-2 pb-1">
        {/* Background track line */}
        <div className="absolute top-5 left-4 right-4 sm:left-8 sm:right-8 h-1 bg-slate-800 rounded-full -translate-y-1/2 z-0" />
        
        {/* Active progress fill line */}
        <div 
          className="absolute top-5 left-4 sm:left-8 h-1 bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-400 rounded-full -translate-y-1/2 z-0 transition-all duration-500 ease-out"
          style={{ width: `calc(${progressPercent}% * (100% - 32px) / 100)` }}
        />

        {/* 5 Milestone Circles */}
        <div className="relative z-10 flex items-start justify-between">
          {steps.map((step) => {
            const isCompleted = activeStep > step.id || (isResolved && step.id === 5);
            const isCurrent = activeStep === step.id && !isResolved;
            const isPending = activeStep < step.id;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center text-center group cursor-default max-w-[70px] sm:max-w-[100px]"
              >
                {/* Node icon circle */}
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : isCurrent
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 shadow-lg shadow-amber-500/30 scale-105'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Node Label */}
                <div className="mt-2 space-y-0.5">
                  <span
                    className={`block text-[11px] sm:text-xs font-bold leading-tight ${
                      isCompleted
                        ? 'text-emerald-300'
                        : isCurrent
                        ? 'text-amber-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="hidden sm:block text-[10px] text-slate-500 leading-tight">
                    {step.shortDesc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Motivational Footer */}
      <div className="pt-1 flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 rounded-xl px-3 py-2 border border-slate-800/80">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px] sm:text-xs text-slate-300 font-medium">
            <strong className="text-amber-300">Khích lệ tư duy:</strong> {getMotivationalMessage()}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <span>Quy tắc: Tự làm chủ kiến thức</span>
        </div>
      </div>
    </div>
  );
};
