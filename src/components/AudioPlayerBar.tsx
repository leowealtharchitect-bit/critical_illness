import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  X,
  Sparkles,
} from 'lucide-react';
import { AudioState, audioManager } from '../utils/audio';
import { VoiceName } from '../types';

interface AudioPlayerBarProps {
  audioState: AudioState;
  currentTitle: string;
  currentVoice?: VoiceName;
  onVoiceChange?: (voice: VoiceName) => void;
  onClose: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  audioState,
  currentTitle,
  onClose,
}) => {
  const [rate, setRate] = React.useState<number>(1.0);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (audioState.isPlaying) {
      audioManager.pause();
    } else {
      audioManager.resume();
    }
  };

  const handleReplay = () => {
    audioManager.seek(0);
    audioManager.resume();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioManager.seek(val);
  };

  const cycleRate = () => {
    const rates = [1.0, 1.25, 1.5];
    const nextIdx = (rates.indexOf(rate) + 1) % rates.length;
    const newRate = rates[nextIdx];
    setRate(newRate);
    audioManager.setRate(newRate);
  };

  return (
    <div
      id="gemini-tts-player-bar"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[480px] z-50 bg-slate-900/95 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 backdrop-blur-lg animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      {/* Top row: Title + Voice Badge + Close */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Volume2 className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-[220px]">
                {currentTitle || 'Leo 助理原声导读'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-mono">
                原声导读
              </span>
            </div>
          </div>
        </div>

        {/* Leo Voice Assistant Badge & Close */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-semibold select-none shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Leo 助理</span>
          </div>

          <button
            id="close-tts-player-btn"
            onClick={onClose}
            className="w-6 h-6 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
            title="关闭播报器"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar Slider */}
      <div className="flex items-center gap-2.5 mb-2.5 text-[11px] font-mono text-slate-400">
        <span>{formatTime(audioState.currentTime)}</span>
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min="0"
            max={audioState.duration || 100}
            step="0.1"
            value={audioState.currentTime || 0}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
        <span>{formatTime(audioState.duration)}</span>
      </div>

      {/* Controls & Visualizer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
        <div className="flex items-center gap-2">
          {/* Replay */}
          <button
            id="audio-replay-btn"
            onClick={handleReplay}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
            title="重新播放"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Main Play / Pause */}
          <button
            id="audio-play-pause-btn"
            onClick={handlePlayPause}
            disabled={audioState.isLoading}
            className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center transition shadow-md shadow-amber-500/30"
            title={audioState.isPlaying ? '暂停' : '播放'}
          >
            {audioState.isLoading ? (
              <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : audioState.isPlaying ? (
              <Pause className="w-4 h-4 fill-slate-950" />
            ) : (
              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
            )}
          </button>

          {/* Speed Button */}
          <button
            id="audio-speed-btn"
            onClick={cycleRate}
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition"
            title="调整播放语速"
          >
            {rate}x
          </button>
        </div>

        {/* Audio Waveform Animation when playing */}
        <div className="flex items-end gap-1 h-5 px-2">
          {[40, 75, 100, 60, 90, 45, 80, 50].map((height, idx) => (
            <span
              key={idx}
              className={`w-1 rounded-full bg-amber-400 transition-all duration-200 ${
                audioState.isPlaying
                  ? 'animate-pulse'
                  : 'opacity-30'
              }`}
              style={{
                height: audioState.isPlaying ? `${height}%` : '20%',
                animationDelay: `${idx * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      {audioState.error && (
        <div className="mt-2 text-xs text-rose-400 bg-rose-950/40 px-2 py-1 rounded border border-rose-800/50">
          {audioState.error}
        </div>
      )}
    </div>
  );
};
