import React from 'react';
import {
  CreditCard,
  Banknote,
  TrendingDown,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Volume2,
  ArrowRight,
  Heart,
  Award,
  Sparkles,
  Shield,
  FileCheck2,
  Landmark,
} from 'lucide-react';
import { THREE_PILLARS, LEO_BRAND_INFO, LEO_FIVE_PILLARS } from '../data/insuranceContent';
import { useLeoAvatar } from '../context/AvatarContext';

interface ConceptComparisonProps {
  onPlayEssay: () => void;
  isPlayingAudio: boolean;
  isLoadingAudio: boolean;
  onScrollToCalculator: () => void;
  onOpenConsult: () => void;
}

export const ConceptComparison: React.FC<ConceptComparisonProps> = ({
  onPlayEssay,
  isPlayingAudio,
  isLoadingAudio,
  onScrollToCalculator,
  onOpenConsult,
}) => {
  const { avatarUrl } = useLeoAvatar();
  return (
    <section className="space-y-12">
      {/* Leo Personal Brand Hero Showcase */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl border border-amber-500/30">
        {/* Background Skyline Image with Luxury Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={LEO_BRAND_INFO.bannerUrl}
            alt="Kuala Lumpur Skyline & Family Legacy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30 sm:opacity-40 filter saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Main Content */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          {/* Top Brand Identity Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-800/80">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full ring-2 ring-amber-400/80 p-0.5 bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
                  <img
                    src={avatarUrl}
                    alt="Leo 家庭财富传承规划师"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top rounded-full bg-slate-900"
                  />
                </div>
                <span className="absolute -top-2 -right-1 text-base select-none">👑</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Leo
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    {LEO_BRAND_INFO.title}
                  </span>
                  <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
                    {LEO_BRAND_INFO.titleEn}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-amber-200/90 flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" />
                    {LEO_BRAND_INFO.coreTagline}
                  </span>
                  <span className="text-slate-600 text-xs hidden md:inline">|</span>
                  <span className="text-xs text-slate-300 hidden md:inline">
                    {LEO_BRAND_INFO.slogan}
                  </span>
                </div>
              </div>
            </div>

            {/* Vision Tag */}
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                {LEO_BRAND_INFO.visionEn}
              </span>
              <span className="text-xs text-slate-300 font-medium mt-0.5">
                {LEO_BRAND_INFO.subSlogan}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Brand Core Manifesto (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold border border-amber-500/30">
                <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>马来西亚家庭资产守护底盘 · 工程师严谨思维</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                真正毁掉一个家庭的，很多时候不是贫穷，
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 block mt-2">
                  而是突发风险降临时，全家毫无准备。
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                在大马，很多人以为买了医药卡就万无一失。然而当大病来临时才猛然警醒：
                <strong className="text-white font-semibold"> 医药卡是赔给医院的，解决不了因病休养 1~3 年时全家每月的房贷、车贷与柴米油盐！</strong>
                重疾险赔付到个人账户的一大笔现金，才是守护全家体面与尊严的「生活替代金」。
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                <button
                  id="hero-play-audio-btn"
                  onClick={onPlayEssay}
                  disabled={isLoadingAudio}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 transition-all active:scale-95"
                >
                  {isLoadingAudio ? (
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                  )}
                  <span>{isPlayingAudio ? '暂停 Leo 助理导读' : '🎙️ 收听 Leo 助理原声导读'}</span>
                </button>

                <button
                  id="hero-scroll-calc-btn"
                  onClick={onScrollToCalculator}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition"
                >
                  <span>用工程师思维测算缺口</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>

                <button
                  id="hero-consult-btn"
                  onClick={onOpenConsult}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
                >
                  <HeartHandshake className="w-4 h-4 text-amber-400" />
                  <span>打字【重疾】预约自查</span>
                </button>
              </div>
            </div>

            {/* Right: Personal IP Seal Card (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm shadow-xl">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Crowned Large Portrait */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-amber-400/80 p-1 bg-gradient-to-b from-amber-300 to-amber-600 shadow-xl shadow-amber-500/30 overflow-hidden relative">
                    <img
                      src={avatarUrl}
                      alt="Leo 家庭财富传承规划师"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top rounded-full bg-slate-950"
                    />
                  </div>
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow">👑</span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-white">Leo</h3>
                  <p className="text-amber-400 font-semibold text-sm mt-0.5">
                    {LEO_BRAND_INFO.title}
                  </p>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    {LEO_BRAND_INFO.coreTagline}
                  </p>
                </div>

                {/* Golden Badge Seal */}
                <div className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{LEO_BRAND_INFO.badgeText}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  “{LEO_BRAND_INFO.missionQuote}”
                </p>

                <div className="w-full pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>🇲🇾 马来西亚在地规划</span>
                  <span className="text-amber-400 font-semibold">1-on-1 亲自梳理</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leo's 5 Core Pillars Showcase: 5大规划支柱与守护系统 */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Leo 个人品牌核心体系 · 工程师思维全局观</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2">
              Leo 的 5 大规划支柱与家庭守护系统
            </h2>
            <p className="text-sm text-slate-700 mt-1">
              以工程师的严谨逻辑，打好医疗与重疾两大现金流底盘，护航家庭资产世代长青
            </p>
          </div>

          <div className="text-xs text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 self-start md:self-auto">
            <span className="font-semibold text-amber-800">当前工具：</span>
            <span>聚焦第 01 & 02 支柱（家庭现金流护城河）</span>
          </div>
        </div>

        {/* 5 Pillar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {LEO_FIVE_PILLARS.map((pillar) => {
            const isCore = pillar.isCurrentToolCore;
            return (
              <div
                key={pillar.id}
                className={`relative rounded-2xl p-5 transition-all flex flex-col justify-between ${
                  isCore
                    ? 'bg-gradient-to-b from-amber-50/90 to-white border-2 border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {isCore && (
                  <span className="absolute -top-3 right-3 text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                    本测算器核心
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-2xl font-black text-amber-700">
                      {pillar.number}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        isCore
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {pillar.slogan}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    {pillar.id === 'pillar-ci' ? '生活替代金' : pillar.id === 'pillar-medical' ? '住院零现金' : '专属资产防护'}
                  </span>
                  <span className="text-amber-800 font-semibold">
                    Leo 规划体系
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid: 医药卡 vs 重疾险 */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            很多人以为买了医药卡就万无一失？
          </h2>
          <p className="text-slate-700 mt-2 text-sm sm:text-base">
            厘清两者的本质边界，才能真正看懂家庭防线里的致命漏洞
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 医药卡 Card */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800">
                    报销医疗账单
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">💳 医药卡 (医疗险)</h3>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-900 block mb-1">赔付去向：</span>
                <p className="text-slate-700">
                  直接帮我们把钱付给<span className="font-bold text-emerald-700">医院</span>，凭收据账单实报实销。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-900 block mb-1">解决的核心痛点：</span>
                <p className="text-slate-700">
                  住院期间的手术费、ICU重症监护、处方化疗与医药发票开销。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100">
                <span className="font-semibold text-rose-900 flex items-center gap-1 mb-1">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  医药卡解决不了的盲区：
                </span>
                <p className="text-rose-800 text-xs sm:text-sm leading-relaxed">
                  大病出院后 1~3 年康复期无法上班的<span className="font-bold">工资收入中断</span>、
                  家里的<span className="font-bold">房贷车贷</span>、子女教育、看护陪护费与营养费，医院不会给开收据报销。
                </p>
              </div>
            </div>
          </div>

          {/* 重疾险 Card */}
          <div className="rounded-2xl bg-gradient-to-b from-amber-50/60 to-white border-2 border-amber-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition relative">
            <div className="absolute -top-3 right-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-sm">
                家庭生活救命钱
              </span>
            </div>

            <div className="flex items-center justify-between pb-5 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    大额现金直接给付
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">💰 重疾险 (重大疾病险)</h3>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
                <span className="font-semibold text-slate-900 block mb-1">赔付去向：</span>
                <p className="text-slate-700">
                  一旦确诊合同约定的重大疾病，保险公司<span className="font-bold text-amber-700">直接赔付给你个人一大笔现金</span>。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
                <span className="font-semibold text-slate-900 block mb-1">解决的核心痛点：</span>
                <p className="text-slate-700">
                  作为大病休养期的<span className="font-bold text-amber-800">「家庭生活替代金」</span>，填补收入停摆空白，守住房贷与家庭基本开销。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-100">
                <span className="font-semibold text-emerald-900 flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  重疾险赋予的自由权：
                </span>
                <p className="text-emerald-800 text-xs sm:text-sm leading-relaxed">
                  不限用途，无论用于安心休养不上班、偿还月供、支付家人误工看护，还是选择国内外的特需医疗，全都由你自由支配！
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The 3 Pillars: 为什么重疾险对一个家庭这么重要？ */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-wider text-amber-800 uppercase px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
            核心支柱价值
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-3">
            为什么重疾险对一个家庭这么重要？
          </h2>
          <p className="text-slate-700 mt-2 text-sm sm:text-base">
            大病击溃一个家庭往往不是医药费本身，而是整个家庭现金流的长期塌方
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {THREE_PILLARS.map((pillar) => {
            const IconComponent =
              pillar.num === '1'
                ? TrendingDown
                : pillar.num === '2'
                ? ShieldCheck
                : HeartHandshake;

            return (
              <div
                key={pillar.id}
                className="relative rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-lg border border-amber-200">
                      {pillar.num}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {pillar.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-bold text-slate-900">{pillar.title}</h3>
                  </div>
                  <h4 className="text-xs font-medium text-amber-700 mb-3">{pillar.subtitle}</h4>

                  <p className="text-slate-700 text-sm leading-relaxed mb-5">
                    {pillar.description}
                  </p>

                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    {pillar.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Love & Peace Golden Quote Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 border border-amber-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <blockquote className="text-lg sm:text-xl font-bold text-slate-900">
              “买保险不是因为害怕，而是因为爱。”
            </blockquote>
            <p className="text-xs sm:text-sm text-slate-700 mt-1">
              想检查一下自己现有的重疾保额够不够、或者想做一次保单梳理？欢迎在评论区打字【重疾】或直接预约自查。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 w-full sm:w-auto">
          <button
            id="quote-banner-consult-btn"
            onClick={onOpenConsult}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition text-center flex items-center justify-center gap-2"
          >
            <span>打字【重疾】预约保单体检自查 📩</span>
          </button>
        </div>
      </div>
    </section>
  );
};
