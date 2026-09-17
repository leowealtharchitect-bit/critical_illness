import React from 'react';
import {
  Volume2,
  ShieldCheck,
  Award,
  Sparkles,
  Play,
  Pause,
  AlertCircle,
  Building2,
  HeartHandshake,
  CheckCircle,
} from 'lucide-react';
import { LEO_VIDEO_INSIGHT, LEO_BRAND_INFO } from '../data/insuranceContent';
import { useLeoAvatar } from '../context/AvatarContext';

interface PlannerVideoProfileProps {
  onPlayLeoInsight: () => void;
  isPlayingLeoInsight: boolean;
  isLoadingAudio: boolean;
  onOpenConsult: () => void;
}

export const PlannerVideoProfile: React.FC<PlannerVideoProfileProps> = ({
  onPlayLeoInsight,
  isPlayingLeoInsight,
  isLoadingAudio,
  onOpenConsult,
}) => {
  const { avatarUrl } = useLeoAvatar();

  return (
    <div
      id="planner-video-profile-card"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/80 text-white p-6 sm:p-8 border-2 border-amber-500/40 shadow-2xl"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Planner Badge & Bio */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-start sm:items-center gap-4">
            {/* Real Leo Portrait with Gold Rim and Crown */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full ring-4 ring-amber-400 p-0.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-xl shadow-amber-500/30 overflow-hidden relative">
                <img
                  src={avatarUrl}
                  alt="Leo 家庭财富传承规划师"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top rounded-full bg-slate-900"
                />
              </div>
              <span className="absolute -top-2 -right-1 text-lg select-none">👑</span>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center shadow"
                title="Leo 助理原声导读已就绪"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Leo</span>
                  <span className="text-sm font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                    {LEO_BRAND_INFO.title}
                  </span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/15 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  {LEO_BRAND_INFO.coreTagline}
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium mt-1">
                {LEO_BRAND_INFO.badgeText} · {LEO_BRAND_INFO.slogan}
              </p>
            </div>
          </div>

          {/* Video Real Takeaway Highlight */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2 text-xs sm:text-sm text-slate-200">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Building2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Leo 核心洞察：买保险是保障的开始，而不是家庭规划的结束</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              “你花了十几年买保险，每个月认真缴费，可是如果有一天你真的不在了，家人知道保单放在哪里、知道应该找谁吗？<strong className="text-white font-semibold">保险的真正意义不是买下来的那一天，而是风险发生后家人能不能真正用到</strong>——受益安排、保单位置、理赔对接人，比买几张保单更值得检查！”
            </p>
          </div>

          {/* Leo 5-Pillar System Tags */}
          <div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-300">
            {[
              '医疗保障 (守护健康)',
              '保险规划 (守护家人)',
              '信托规划 (守护资产)',
              '遗嘱规划 (守护意愿)',
              '财富传承系统 (守护未来)',
            ].map((tag, idx) => (
              <span
                key={tag}
                className={`px-2.5 py-1 rounded-lg border ${
                  idx < 2
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 font-semibold'
                    : 'bg-slate-800/90 text-slate-300 border-slate-700'
                }`}
              >
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto flex-shrink-0">
          <button
            id="play-leo-video-voice-btn"
            onClick={onPlayLeoInsight}
            disabled={isLoadingAudio}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 transition active:scale-95"
            title="收听 Leo 助理原声导读"
          >
            {isLoadingAudio ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : isPlayingLeoInsight ? (
              <Pause className="w-4 h-4 fill-slate-950" />
            ) : (
              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
            )}
            <span>{isPlayingLeoInsight ? '暂停 Leo 助理导读' : '🎧 Leo 助理原声导读'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/20 text-slate-950 font-mono">
              Leo 助理
            </span>
          </button>

          <button
            id="consult-leo-btn"
            onClick={onOpenConsult}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 shadow-md transition"
          >
            <HeartHandshake className="w-4 h-4 text-amber-400" />
            <span>打字【重疾】预约 1-对-1 自查 📩</span>
          </button>
        </div>
      </div>
    </div>
  );
};
