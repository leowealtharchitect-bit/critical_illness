import React, { useState } from 'react';
import { Sparkles, Volume2, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
import { CalculatorState, CalculationResult } from '../types';

interface AiAnalysisCardProps {
  calcState: CalculatorState;
  result: CalculationResult;
  onPlaySpeech: (text: string, title: string) => void;
  isLoadingAudio: boolean;
  isPlayingAudio: boolean;
}

export const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({
  calcState,
  result,
  onPlaySpeech,
  isLoadingAudio,
  isPlayingAudio,
}) => {
  const [analysisText, setAnalysisText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyLiving: calcState.monthlyLiving,
          monthlyDebt: calcState.monthlyDebt,
          annualEducation: calcState.annualEducation,
          recoveryYears: calcState.recoveryYears,
          specialCare: calcState.specialCare,
          existingCoverage: calcState.existingCoverage,
          emergencyFund: calcState.emergencyFund,
          suggestedCoverage: result.suggestedCoverage,
          gap: result.gap,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '生成分析失败');
      }
      setAnalysisText(data.analysis);
      setHasGenerated(true);
    } catch (err: any) {
      console.error('Failed to generate AI analysis:', err);
      // Fallback local analytical diagnosis if backend key is missing or errored
      const fallback = `【Leo 规划师·工程师思维深度体检报告】
根据您的大马家庭财务量化测算，在 ${calcState.recoveryYears} 年黄金休养期内，家庭刚性生活与还贷总需求为 RM ${result.suggestedCoverage.toLocaleString()} 令吉。目前您面临的重疾保额缺口约为 RM ${result.gap.toLocaleString()} 令吉。

💡 Leo 的核心工程诊断建议：
1. 医疗卡不是免死金牌：在大马，医药卡负责清偿医院手术住院账单，但大病休养 1~3 年的供房、供车、孩子学费和一家人的开销一分也不会停。
2. 守护底层资产与公积金：重疾险直接打入个人账户的一大笔现金，是真正的「生活替代金」，能避免在最脆弱时被迫清空 EPF 养老储蓄或被迫折价低卖房产。
3. 财富传承始于稳固底盘：作为家庭财富传承规划师，我始终强调：没有健全的重疾防御网，任何高维度的信托与财富传承规划都是沙滩上的城堡。买保险不是因为害怕，而是因为爱！

— Leo 家庭财富传承规划师 · 工程师思维 × 幸福财富传承`;
      setAnalysisText(fallback);
      setHasGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      id="ai-analysis-container"
      className="rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border-2 border-amber-200/90 p-6 sm:p-8 shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                Leo「工程师思维」AI 智能精算复核与体检点评
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Leo IP 专属
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              融入 Leo 家庭财富传承系统理念 · 基于您测算数据的一对一定制点评
            </p>
          </div>
        </div>

        <button
          id="trigger-ai-analysis-btn"
          onClick={generateAnalysis}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>正在智能诊断...</span>
            </>
          ) : hasGenerated ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>重新生成评估</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>生成深度体检建议</span>
            </>
          )}
        </button>
      </div>

      {/* Content Area */}
      {hasGenerated && analysisText ? (
        <div className="space-y-4 pt-2">
          <div className="p-5 rounded-2xl bg-white/90 border border-amber-100 shadow-sm text-slate-800 text-sm leading-relaxed whitespace-pre-line">
            {analysisText}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-700">
              💡 本建议结合您输入的月开支 RM {calcState.monthlyLiving.toLocaleString()}、月供负债 RM{' '}
              {calcState.monthlyDebt.toLocaleString()} 测算生成
            </span>

            <button
              id="ai-tts-speak-btn"
              onClick={() => onPlaySpeech(analysisText, 'AI 专家诊断意见朗读')}
              disabled={isLoadingAudio}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm"
              title="使用 Leo 助理原声朗读这段建议"
            >
              {isLoadingAudio ? (
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              )}
              <span>{isPlayingAudio ? 'Leo 助理正在播报' : '🎙️ 用 Leo 助理原声朗读建议'}</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-slate-950/10 font-mono">
                Leo 助理
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white/60 border border-dashed border-amber-200 text-center space-y-2">
          <p className="text-xs sm:text-sm text-slate-700">
            点击上方按钮，AI 专家将根据您的收支负债情况深度分析：为什么医药卡不够、如何针对性补全保额缺口，并支持一键语音播报。
          </p>
        </div>
      )}
    </div>
  );
};
