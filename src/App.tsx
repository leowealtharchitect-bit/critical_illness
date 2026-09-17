import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { ConceptComparison } from './components/ConceptComparison';
import { PlannerVideoProfile } from './components/PlannerVideoProfile';
import { CoverageCalculator } from './components/CoverageCalculator';
import { AiAnalysisCard } from './components/AiAnalysisCard';
import { EducationalFaq } from './components/EducationalFaq';
import { PolicyConsultModal } from './components/PolicyConsultModal';
import { CustomerLeadsDashboardModal } from './components/CustomerLeadsDashboardModal';
import {
  calculateCoverage,
  CORE_ESSAY_TEXT,
  LEO_VIDEO_INSIGHT,
} from './data/insuranceContent';
import { CalculatorState, VoiceName } from './types';
import { audioManager, AudioState } from './utils/audio';
import { Heart, MessageSquareHeart, Shield, Sparkles } from 'lucide-react';
import { useLeoAvatar } from './context/AvatarContext';

export default function App() {
  const { avatarUrl } = useLeoAvatar();
  // Calculator state (Calibrated for Malaysian middle-class households in RM)
  const [calcState, setCalcState] = useState<CalculatorState>({
    monthlyLiving: 5000,
    monthlyDebt: 3500,
    annualEducation: 15000,
    recoveryYears: 3,
    specialCare: 50000,
    existingCoverage: 150000,
    emergencyFund: 50000,
  });

  // Derived calculation result
  const result = calculateCoverage(calcState);

  // Audio & TTS states - Leo 助理原声导读 ('Leo')
  const [audioState, setAudioState] = useState<AudioState>(audioManager.state);
  const [currentAudioTitle, setCurrentAudioTitle] = useState<string>('Leo 助理原声导读');
  const [currentVoice] = useState<VoiceName>('Leo');
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [showPlayer, setShowPlayer] = useState<boolean>(false);
  const [activeTextPlaying, setActiveTextPlaying] = useState<string>('');
  const [customVoiceUrl, setCustomVoiceUrl] = useState<string | null>(null);

  const checkVoiceStatus = useCallback(() => {
    fetch('/api/voice-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasVoice && data.url) {
          setCustomVoiceUrl(data.url);
        }
      })
      .catch(() => {});
  }, []);

  // Check if Leo's direct studio voice recording is saved on server
  useEffect(() => {
    checkVoiceStatus();

    // Check if admin/planner URL query was used
    if (typeof window !== 'undefined') {
      const search = window.location.search.toLowerCase();
      if (search.includes('admin=leo') || search.includes('planner=1')) {
        setIsLeadsDashboardOpen(true);
      }
    }
  }, [checkVoiceStatus]);

  // Listen for audio file drop anywhere to update Leo's voice recording file
  useEffect(() => {
    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (
        file &&
        (file.type.startsWith('audio/') ||
          file.type.startsWith('video/') ||
          file.name.endsWith('.mp3') ||
          file.name.endsWith('.wav') ||
          file.name.endsWith('.m4a'))
      ) {
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          try {
            const res = await fetch('/api/admin/save-voice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl }),
            });
            if (res.ok) {
              setCustomVoiceUrl('/assets/brand/leo_voice.mp3?t=' + Date.now());
              console.log('Leo authentic voice recording updated successfully.');
            }
          } catch (err) {
            console.error('Failed to save dropped voice file:', err);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);
    return () => {
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, []);

  // Consultation modal & Leads Table
  const [isConsultOpen, setIsConsultOpen] = useState<boolean>(false);
  const [isLeadsDashboardOpen, setIsLeadsDashboardOpen] = useState<boolean>(false);
  const [leadsCount, setLeadsCount] = useState<number>(0);

  const refreshLeadsCount = useCallback(async () => {
    try {
      const res = await fetch('/api/consultations');
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeadsCount(data.leads.length);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshLeadsCount();
  }, [refreshLeadsCount]);

  // Listen to audioManager updates
  useEffect(() => {
    const unsubscribe = audioManager.subscribe((state) => {
      setAudioState(state);
    });
    return () => {
      unsubscribe();
      audioManager.stop();
    };
  }, []);

  // Handler for playing text via Gemini TTS (gemini-3.1-flash-tts-preview)
  const playTtsSpeech = useCallback(
    async (text: string, title: string) => {
      if (isLoadingAudio) return;

      // If already playing this exact track, toggle play/pause
      if (activeTextPlaying === text && audioState.isPlaying) {
        audioManager.pause();
        return;
      }
      if (activeTextPlaying === text && !audioState.isPlaying && audioState.duration > 0) {
        audioManager.resume();
        setShowPlayer(true);
        return;
      }

      setIsLoadingAudio(true);
      setCurrentAudioTitle(title);
      setActiveTextPlaying(text);
      setShowPlayer(true);

      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: currentVoice,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'TTS 转换服务暂时不可用');
        }

        if (data.audioBase64) {
          await audioManager.playBase64Wav(data.audioBase64);
        } else {
          throw new Error('未收到有效音频流');
        }
      } catch (err: any) {
        console.warn('Gemini TTS failed, falling back to Web Speech synthesis:', err);
        // Robust browser fallback so user always gets speech feedback even without network
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'zh-CN';
          utterance.rate = 1.0;
          utterance.onstart = () => {
            setAudioState((prev) => ({ ...prev, isPlaying: true }));
          };
          utterance.onend = () => {
            setAudioState((prev) => ({ ...prev, isPlaying: false }));
          };
          window.speechSynthesis.speak(utterance);
        } else {
          alert(`语音合成提示: ${err.message || '请检查网络或配置'}`);
        }
      } finally {
        setIsLoadingAudio(false);
      }
    },
    [isLoadingAudio, activeTextPlaying, audioState.isPlaying, audioState.duration, currentVoice]
  );

  // Play Main Essay with Leo Assistant Voice
  const handlePlayMainEssay = () => {
    playTtsSpeech(CORE_ESSAY_TEXT, 'Leo 助理原声导读：为什么医药卡不够？');
  };

  // Play Leo Insight with Leo Assistant Voice
  const handlePlayLeoInsight = async () => {
    playTtsSpeech(
      LEO_VIDEO_INSIGHT,
      'Leo 助理原声导读：买保险是保障的开始，而不是家庭规划的结束'
    );
  };

  // Play Calculator Diagnosis Audio with Leo Assistant Voice in RM
  const handlePlayDiagnosisAudio = () => {
    const diagnosisText = `为您完成大马家庭重疾保额自查诊断：在您设定的 ${
      calcState.recoveryYears
    } 年大病康复期内，家庭基础生活开销、房贷车贷与刚性还款共计需要马币 ${result.suggestedCoverage.toLocaleString()} 令吉作为生活替代金。目前您的重疾保额缺口约为马币 ${
      result.gap > 0 ? result.gap.toLocaleString() + ' 令吉' : '零令吉，已备足保障'
    }。请注意：在马来西亚，医药卡是帮我们把钱付给医院，重疾险赔付的一大笔现金才是保障全家生活不停摆的真实现金。建议及时补足缺口！买保险不是因为害怕，而是因为爱。`;

    playTtsSpeech(diagnosisText, 'Leo 助理原声导读：大马家庭保额测算诊断报告');
  };

  const handleScrollToCalculator = () => {
    const el = document.getElementById('coverage-calculator-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar */}
      <Navbar
        onOpenConsult={() => setIsConsultOpen(true)}
        onPlayMainEssay={handlePlayMainEssay}
        isPlayingMainEssay={activeTextPlaying === CORE_ESSAY_TEXT && audioState.isPlaying}
        isLoadingAudio={isLoadingAudio}
        onOpenLeadsDashboard={() => setIsLeadsDashboardOpen(true)}
        leadsCount={leadsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-20">
        {/* Section 1: Concept & Pillars & Side-by-Side Comparison */}
        <ConceptComparison
          onPlayEssay={handlePlayMainEssay}
          isPlayingAudio={activeTextPlaying === CORE_ESSAY_TEXT && audioState.isPlaying}
          isLoadingAudio={isLoadingAudio}
          onScrollToCalculator={handleScrollToCalculator}
          onOpenConsult={() => setIsConsultOpen(true)}
        />

        {/* Section 1.5: Leo Planner Profile & Video Speech Insight */}
        <PlannerVideoProfile
          onPlayLeoInsight={handlePlayLeoInsight}
          isPlayingLeoInsight={activeTextPlaying === LEO_VIDEO_INSIGHT && audioState.isPlaying}
          isLoadingAudio={isLoadingAudio}
          onOpenConsult={() => setIsConsultOpen(true)}
        />

        {/* Section 2: Coverage Calculator & Gap Analysis */}
        <CoverageCalculator
          calcState={calcState}
          onCalcChange={(patch) => setCalcState((prev) => ({ ...prev, ...patch }))}
          result={result}
          onPlayDiagnosisAudio={handlePlayDiagnosisAudio}
          isLoadingAudio={isLoadingAudio}
          isPlayingAudio={
            activeTextPlaying.startsWith('为您完成家庭重疾保额自查诊断') && audioState.isPlaying
          }
          onOpenAiAnalysis={() => {
            const el = document.getElementById('ai-analysis-container');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenConsult={() => setIsConsultOpen(true)}
        />

        {/* Section 3: AI Deep Evaluation (Gemini 3.8 Flash + TTS Playback) */}
        <AiAnalysisCard
          calcState={calcState}
          result={result}
          onPlaySpeech={(text, title) => playTtsSpeech(text, title)}
          isLoadingAudio={isLoadingAudio}
          isPlayingAudio={
            activeTextPlaying !== CORE_ESSAY_TEXT &&
            activeTextPlaying !== LEO_VIDEO_INSIGHT &&
            !activeTextPlaying.startsWith('为您完成家庭重疾保额自查诊断') &&
            audioState.isPlaying
          }
        />

        {/* Section 4: Educational FAQ */}
        <EducationalFaq onOpenConsult={() => setIsConsultOpen(true)} />
      </main>

      {/* Bottom Sticky Action / Callout Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white border-t-2 border-amber-500/30 py-10 px-4 sm:px-6 lg:px-8 mt-12 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5 max-w-3xl">
            {/* Leo Round Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-4 ring-amber-400 p-0.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-xl overflow-hidden relative">
                <img
                  src={avatarUrl}
                  alt="Leo 家庭财富传承规划师"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top rounded-full bg-slate-900"
                />
              </div>
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg select-none">👑</span>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>买保险不是因为害怕，而是因为爱 · Leo 规划师箴言</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                想检查自己现有的重疾保额够不够？私信规划师 Leo 做免费保单体检
              </h3>
              <p className="text-amber-100/80 text-xs sm:text-sm leading-relaxed">
                工程师思维 × 幸福财富传承：Leo 帮您以理性精算撕开保单迷雾，筑牢医疗、重疾、信托与财富传承五大底盘。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 flex-shrink-0">
            <button
              id="footer-quick-essay-btn"
              onClick={handlePlayMainEssay}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/30 transition flex items-center gap-1.5"
            >
              <span>🎙️ 收听 Leo 助理原声导读</span>
            </button>
            <button
              id="footer-open-consult-btn"
              onClick={() => setIsConsultOpen(true)}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 transition active:scale-95"
            >
              打字【重疾】私信 Leo 预约自查 📩
            </button>
          </div>
        </div>
      </div>

      {/* Footer Copyright & Note */}
      <footer className="bg-slate-950 text-slate-400 py-6 border-t border-slate-900 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400">Leo 家庭财富传承规划师</span>
            <span>· 工程师思维 × 幸福财富传承</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="text-slate-500">
              涵盖大马五大规划：医疗保障 · 保险规划 · 信托规划 · 遗嘱规划 · 财富传承系统
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Audio Player Bar */}
      {showPlayer && (
        <AudioPlayerBar
          audioState={audioState}
          currentTitle={currentAudioTitle}
          onClose={() => {
            audioManager.stop();
            setShowPlayer(false);
          }}
        />
      )}

      {/* Consultation Modal */}
      <PolicyConsultModal
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        calculatedGap={result.gap}
        onLeadSubmitted={refreshLeadsCount}
      />

      {/* Planner's Cumulative Customer Leads Dashboard & Voice Studio */}
      <CustomerLeadsDashboardModal
        isOpen={isLeadsDashboardOpen}
        onClose={() => {
          setIsLeadsDashboardOpen(false);
          refreshLeadsCount();
        }}
        onVoiceUpdated={checkVoiceStatus}
      />
    </div>
  );
}

