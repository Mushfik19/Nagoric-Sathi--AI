import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check, Sparkles, Volume2 } from 'lucide-react';
import { toBanglaNumber } from '../../utils/formatters';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlobOrUrl: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'recorded'>('idle');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = window.setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  const handleStart = () => {
    setSecondsElapsed(0);
    setRecordingState('recording');
  };

  const handlePause = () => {
    setRecordingState('paused');
  };

  const handleResume = () => {
    setRecordingState('recording');
  };

  const handleStop = () => {
    setRecordingState('recorded');
    setIsPlaying(false);
    onRecordingComplete('mock_voice_recording_ward12.mp3');
  };

  const handleReset = () => {
    setRecordingState('idle');
    setSecondsElapsed(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${toBanglaNumber(mins)}:${toBanglaNumber(String(secs).padStart(2, '0'))}`;
  };

  return (
    <div className="bg-[var(--paper)] border border-[var(--line)] rounded-2xl p-4 text-center transition">
      <div className="flex items-center justify-between mb-3 text-xs text-[var(--muted)]">
        <span className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
          <Mic className="w-4 h-4 text-[var(--green)]" />
          ভয়েস নোট রেকর্ডার (Bangla Voice Input)
        </span>
        <span className="flex items-center gap-1 text-[11px] text-[var(--green)] bg-[var(--green-light)] px-2.5 py-1 rounded font-medium border border-[var(--line-subtle)]">
          <Sparkles className="w-3 h-3 text-[var(--green)]" />
          AI স্পিচ-টু-টেক্সট সহায়তাপ্রাপ্ত
        </span>
      </div>

      {/* Visualizer & Timer Area */}
      <div className="my-4 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold font-mono text-[var(--ink)] tracking-wider mb-2">
          {formatTimer(secondsElapsed)}
        </div>

        {/* Animated Soundwave Simulation */}
        {recordingState === 'recording' && (
          <div className="flex items-center justify-center gap-1 h-8 my-2">
            {[40, 70, 90, 30, 85, 60, 100, 45, 80, 50, 95, 35].map((height, i) => (
              <span
                key={i}
                className="w-1 bg-[var(--green)] rounded-full animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}

        {recordingState === 'idle' && (
          <p className="text-xs text-[var(--muted)] max-w-xs">
            মাইক্রোফোন বাটনে চাপ দিয়ে সমস্যার বিবরণ মুখে বলুন (যেমন: &quot;রাস্তার ড্রেন বন্ধ হয়ে পানি জমে গেছে&quot;)
          </p>
        )}

        {recordingState === 'recorded' && (
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--green)] bg-[var(--green-light)] px-3 py-1.5 rounded-xl border border-[var(--line)]">
            <Check className="w-4 h-4 text-[var(--green)]" />
            <span>ভয়েস নোট ধারণ সম্পন্ন ({formatTimer(secondsElapsed)})</span>
          </div>
        )}
      </div>

      {/* Control Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        {recordingState === 'idle' && (
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-bold shadow-md transition transform active:scale-95 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>কথা বলা শুরু করুন</span>
          </button>
        )}

        {recordingState === 'recording' && (
          <>
            <button
              type="button"
              onClick={handlePause}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--bg)] hover:bg-[var(--paper-elevated)] border border-[var(--line)] text-[var(--ink)] text-xs font-semibold transition cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>বিরতি</span>
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              <span>রেকর্ডিং শেষ করুন</span>
            </button>
          </>
        )}

        {recordingState === 'paused' && (
          <>
            <button
              type="button"
              onClick={handleResume}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--green)] hover:bg-[var(--green-dark)] text-white text-xs font-semibold transition cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>পুনরায় চালু</span>
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              <span>রেকর্ডিং শেষ</span>
            </button>
          </>
        )}

        {recordingState === 'recorded' && (
          <>
            <button
              type="button"
              onClick={togglePlayback}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
                isPlaying
                  ? 'bg-[var(--green-light)] text-[var(--green)] border-[var(--line)]'
                  : 'bg-[var(--bg)] hover:bg-[var(--paper-elevated)] text-[var(--ink)] border-[var(--line)]'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'শুনছেন...' : 'রেকর্ডিং শুনুন'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--bg)] hover:bg-[var(--paper-elevated)] text-[var(--muted)] hover:text-[var(--ink)] text-xs font-medium border border-[var(--line)] transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>আবার রেকর্ড করুন</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
