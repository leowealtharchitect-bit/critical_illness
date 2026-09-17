import React from 'react';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Volume2,
  Shield,
  HelpCircle,
  FileText,
  Sparkles,
  MessageSquareHeart,
} from 'lucide-react';
import { CalculatorState, CalculationResult } from '../types';
import { useLeoAvatar } from '../context/AvatarContext';

interface CoverageCalculatorProps {
  calcState: CalculatorState;
  onCalcChange: (newState: Partial<CalculatorState>) => void;
  result: CalculationResult;
  onPlayDiagnosisAudio: () => void;
  isLoadingAudio: boolean;
  isPlayingAudio: boolean;
  onOpenAiAnalysis: () => void;
  onOpenConsult: () => void;
}

export const CoverageCalculator: React.FC<CoverageCalculatorProps> = ({
  calcState,
  onCalcChange,
  result,
  onPlayDiagnosisAudio,
  isLoadingAudio,
  isPlayingAudio,
  onOpenAiAnalysis,
  onOpenConsult,
}) => {
  const { avatarUrl } = useLeoAvatar();
  const formatMoney = (val: number) => {
    return `RM ${val.toLocaleString()}`;
  };

  const formatCompact = (val: number) => {
    if (val >= 10000) {
      return `RM ${(val / 10000).toFixed(1)} 万 (${val.toLocaleString()})`;
    }
    return `RM ${val.toLocaleString()}`;
  };

  const totalPie = result.suggestedCoverage || 1;
  const livingPct = Math.round((result.incomeReplacement / totalPie) * 100);
  const debtPct = Math.round((result.debtCoverage / totalPie) * 100);
  const eduPct = Math.round((result.educationFund / totalPie) * 100);
  const carePct = Math.round((result.specialCareFund / totalPie) * 100);

  return (
    <section id="coverage-calculator-section" className="space-y-8 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-800 uppercase px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200">
          <span>👑 Leo「工程师思维」量化测算系统 · 支柱 02 核心工具</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
          大马家庭重疾保额缺口与生活替代金测算 (马币 RM)
        </h2>
        <p className="text-slate-700 mt-2 text-sm sm:text-base leading-relaxed">
          以工程师的严谨逻辑与家庭现金流精算法，拆解因病停工 1~3 年维持房贷车贷与全家体面运转所需的真实现金
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-lg">输入家庭财务基本盘 (RM)</h3>
            </div>
            <span className="text-xs text-slate-700 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-full font-medium">
              货币：马币 RM
            </span>
          </div>

          {/* 1. Monthly Living */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label htmlFor="input-monthly-living" className="font-medium text-slate-800 flex items-center gap-1">
                月度基础家庭生活开支 (柴米油盐、水电伙食、生活买菜)
              </label>
              <span className="font-bold text-amber-600 font-mono">
                RM {calcState.monthlyLiving.toLocaleString()} / 月
              </span>
            </div>
            <input
              id="input-monthly-living"
              type="range"
              min={1500}
              max={25000}
              step={250}
              value={calcState.monthlyLiving}
              onChange={(e) => onCalcChange({ monthlyLiving: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[11px] text-slate-700">
              <span>RM 1,500</span>
              <span>RM 12,000</span>
              <span>RM 25,000</span>
            </div>
          </div>

          {/* 2. Monthly Debt */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label htmlFor="input-monthly-debt" className="font-medium text-slate-800 flex items-center gap-1">
                月度刚性债务还款 (房屋贷款 / 汽车贷款 / 固定还款)
              </label>
              <span className="font-bold text-amber-600 font-mono">
                RM {calcState.monthlyDebt.toLocaleString()} / 月
              </span>
            </div>
            <input
              id="input-monthly-debt"
              type="range"
              min={0}
              max={30000}
              step={500}
              value={calcState.monthlyDebt}
              onChange={(e) => onCalcChange({ monthlyDebt: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[11px] text-slate-700">
              <span>无负债 (RM 0)</span>
              <span>RM 15,000</span>
              <span>RM 30,000</span>
            </div>
          </div>

          {/* 3. Recovery Years Selection */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-800">
                大病休养康复周期 (建议覆盖 1~3 年关键康复期)
              </span>
              <span className="font-bold text-amber-600">{calcState.recoveryYears} 年</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => onCalcChange({ recoveryYears: yr })}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                    calcState.recoveryYears === yr
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {yr} 年 {yr === 3 && '(黄金推荐)'}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Annual Education & Elderly Care */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label htmlFor="input-annual-education" className="font-medium text-slate-800">
                年固定子女教育费及父母赡养费 (学费、补习、父母家用)
              </label>
              <span className="font-bold text-amber-600 font-mono">
                RM {calcState.annualEducation.toLocaleString()} / 年
              </span>
            </div>
            <input
              id="input-annual-education"
              type="range"
              min={0}
              max={80000}
              step={2000}
              value={calcState.annualEducation}
              onChange={(e) => onCalcChange({ annualEducation: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[11px] text-slate-700">
              <span>RM 0</span>
              <span>RM 40,000</span>
              <span>RM 80,000</span>
            </div>
          </div>

          {/* 5. Special Care & Nutrition */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label htmlFor="input-special-care" className="font-medium text-slate-800">
                特殊康复护理 / 补品营养 / 专人陪护备用金
              </label>
              <span className="font-bold text-amber-600 font-mono">
                RM {calcState.specialCare.toLocaleString()}
              </span>
            </div>
            <input
              id="input-special-care"
              type="range"
              min={0}
              max={200000}
              step={5000}
              value={calcState.specialCare}
              onChange={(e) => onCalcChange({ specialCare: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[11px] text-slate-700">
              <span>RM 0</span>
              <span>RM 100,000</span>
              <span>RM 200,000</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Existing Coverage */}
            <div className="space-y-1.5">
              <label htmlFor="input-existing-coverage" className="text-xs font-semibold text-slate-700">
                目前已有重疾险保额 (Critical Illness 保额，RM)
              </label>
              <input
                id="input-existing-coverage"
                type="number"
                step={10000}
                value={calcState.existingCoverage}
                onChange={(e) => onCalcChange({ existingCoverage: Math.max(0, Number(e.target.value)) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              <span className="text-[11px] text-slate-700 block">
                约 {formatCompact(calcState.existingCoverage)}
              </span>
            </div>

            {/* Emergency Fund */}
            <div className="space-y-1.5">
              <label htmlFor="input-emergency-fund" className="text-xs font-semibold text-slate-700">
                目前流动备用金 (银行存款 / 应急现金，RM)
              </label>
              <input
                id="input-emergency-fund"
                type="number"
                step={5000}
                value={calcState.emergencyFund}
                onChange={(e) => onCalcChange({ emergencyFund: Math.max(0, Number(e.target.value)) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              <span className="text-[11px] text-slate-700 block">
                约 {formatCompact(calcState.emergencyFund)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic & Gap Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Assessment Card */}
          <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border-2 border-amber-500/40 space-y-6 relative overflow-hidden">
            {/* Top brand endorsement */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full ring-2 ring-amber-400 overflow-hidden bg-slate-950 flex-shrink-0">
                  <img
                    src={avatarUrl}
                    alt="Leo 规划师"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Leo 规划师精算复核</span>
                    <span className="text-amber-400 text-[10px]">👑</span>
                  </span>
                  <span className="text-[10px] text-amber-200/80 block">工程师思维严谨核算</span>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  result.riskLevel === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : result.riskLevel === 'warning'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {result.riskTitle}
              </div>
            </div>

            {/* Highlighted Numbers */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">
                  建议重疾总保额 (覆盖 {calcState.recoveryYears} 年生活停摆)：
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                  RM {result.suggestedCoverage.toLocaleString()}
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    ({formatCompact(result.suggestedCoverage)})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
                  <span className="text-xs text-slate-400 block">已有重疾保额</span>
                  <span className="text-lg font-bold text-slate-200 font-mono">
                    {formatMoney(calcState.existingCoverage)}
                  </span>
                </div>

                <div
                  className={`p-3.5 rounded-xl border ${
                    result.gap > 0
                      ? 'bg-rose-950/40 border-rose-700/60 text-rose-200'
                      : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                  }`}
                >
                  <span className="text-xs block text-slate-400">目前重疾缺口</span>
                  <span className="text-lg font-extrabold font-mono text-amber-400">
                    {result.gap > 0 ? formatMoney(result.gap) : '已足额'}
                  </span>
                </div>
              </div>
            </div>

            {/* Resilience Progress Meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">家庭抗击打防线指数</span>
                <span className="font-bold text-amber-400 font-mono">{result.resilienceScore} / 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.resilienceScore < 40
                      ? 'bg-rose-500'
                      : result.resilienceScore < 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${result.resilienceScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                {result.riskDescription}
              </p>
            </div>

            {/* Breakdown of Replacement Money */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">
                {calcState.recoveryYears} 年生活替代金构成去向：
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>房贷车贷刚性月供 ({debtPct}%)</span>
                  <span className="font-mono">{formatMoney(result.debtCoverage)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>基本柴米油盐开销 ({livingPct}%)</span>
                  <span className="font-mono">{formatMoney(result.incomeReplacement)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>子女教育及赡养费 ({eduPct}%)</span>
                  <span className="font-mono">{formatMoney(result.educationFund)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>特需护理营养储备 ({carePct}%)</span>
                  <span className="font-mono">{formatMoney(result.specialCareFund)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: TTS Voice Playback + AI Analysis + Free Consultation */}
            <div className="space-y-2.5 pt-2">
              <button
                id="play-calc-tts-btn"
                onClick={onPlayDiagnosisAudio}
                disabled={isLoadingAudio}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition"
                title="通过 Leo 助理原声朗读我的专属测算诊断结论"
              >
                {isLoadingAudio ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                )}
                <span>
                  {isPlayingAudio ? 'Leo 助理正在播报...' : '🎙️ 用 Leo 助理原声播报测算诊断'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950/20 text-slate-900 font-mono">
                  Leo 助理
                </span>
              </button>

              <button
                id="open-ai-report-btn"
                onClick={onOpenAiAnalysis}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>生成 AI 保险专家深度诊断意见</span>
              </button>

              <div className="pt-1">
                <button
                  id="calc-open-consult-btn"
                  onClick={onOpenConsult}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white transition shadow-md hover:shadow-lg"
                >
                  <MessageSquareHeart className="w-4 h-4 text-amber-200" />
                  <span>打字【重疾】预约保单梳理与缺口体检 📩</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
