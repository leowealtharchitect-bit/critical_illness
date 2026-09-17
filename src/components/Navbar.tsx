import React from 'react';
import { Shield, Volume2, MessageSquareHeart, Sparkles, Users } from 'lucide-react';
import { useLeoAvatar } from '../context/AvatarContext';

interface NavbarProps {
  onOpenConsult: () => void;
  onPlayMainEssay: () => void;
  isPlayingMainEssay: boolean;
  isLoadingAudio: boolean;
  onOpenLeadsDashboard?: () => void;
  leadsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenConsult,
  onPlayMainEssay,
  isPlayingMainEssay,
  isLoadingAudio,
  onOpenLeadsDashboard,
  leadsCount = 0,
}) => {
  const { avatarUrl } = useLeoAvatar();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full ring-2 ring-amber-400 overflow-hidden shadow-md shadow-amber-900/10 bg-slate-900">
              <img
                src={avatarUrl}
                alt="Leo 家庭财富传承规划师"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <span className="absolute -top-1.5 -right-1 text-xs">👑</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                <span>Leo</span>
                <span className="text-xs sm:text-sm font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                  家庭财富传承规划师
                </span>
              </span>
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                工程师思维 × 幸福财富传承
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              A Brighter Legacy Together · 规划现在 · 守护未来
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* TTS Essay Listen Button */}
          <button
            id="navbar-listen-essay-btn"
            onClick={onPlayMainEssay}
            disabled={isLoadingAudio}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              isPlayingMainEssay
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
            title="收听 Leo 助理原声导读"
          >
            {isLoadingAudio ? (
              <span className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Volume2 className={`w-4 h-4 ${isPlayingMainEssay ? 'text-amber-700 animate-pulse' : 'text-slate-600'}`} />
            )}
            <span className="hidden sm:inline">
              {isPlayingMainEssay ? '正在播放 Leo 助理导读' : '🎙️ Leo 助理原声导读'}
            </span>
            <span className="sm:hidden">
              {isPlayingMainEssay ? '播放中' : 'Leo 助理导读'}
            </span>
            <span className="hidden lg:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-amber-200/80 text-amber-900 font-medium">
              Leo 助理
            </span>
          </button>

          {/* Quick Consultation CTA */}
          <button
            id="navbar-open-consult-btn"
            onClick={onOpenConsult}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all hover:shadow"
          >
            <MessageSquareHeart className="w-4 h-4 text-amber-400" />
            <span>打字【重疾】预约自查</span>
          </button>
        </div>
      </div>
    </header>
  );
};
