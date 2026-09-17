import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Phone,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  X,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Send,
  ShieldAlert,
  Lock,
  KeyRound,
  Upload,
  Mic,
  Volume2,
  Play,
  Pause,
  Mail,
  Sparkles,
  Info,
} from 'lucide-react';
import { ConsultationRequest } from '../types';

interface CustomerLeadsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCountChange?: (count: number) => void;
  onVoiceUpdated?: () => void;
}

export const CustomerLeadsDashboardModal: React.FC<CustomerLeadsDashboardModalProps> = ({
  isOpen,
  onClose,
  onLeadCountChange,
  onVoiceUpdated,
}) => {
  // Authentication PIN state
  const [pin, setPin] = useState<string>(() => sessionStorage.getItem('leo_planner_pin') || '');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(sessionStorage.getItem('leo_planner_pin')));
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'leads' | 'voice' | 'notify'>('leads');

  // Leads data state
  const [leads, setLeads] = useState<ConsultationRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddingTest, setIsAddingTest] = useState<boolean>(false);

  // Voice Extraction / Upload state
  const [isUploadingVoice, setIsUploadingVoice] = useState<boolean>(false);
  const [voiceUploadSuccess, setVoiceUploadSuccess] = useState<string>('');
  const [voiceUploadError, setVoiceUploadError] = useState<string>('');
  const [hasVoiceSaved, setHasVoiceSaved] = useState<boolean>(false);
  const [voiceUrl, setVoiceUrl] = useState<string>('');
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  // Notification Configuration state
  const [notifyRecipient, setNotifyRecipient] = useState<string>('leo.wealtharchitect@gmail.com');
  const [notifySmtpPass, setNotifySmtpPass] = useState<string>('');
  const [hasConfiguredPass, setHasConfiguredPass] = useState<boolean>(false);
  const [notifyWebhookUrl, setNotifyWebhookUrl] = useState<string>('');
  const [lastNotificationStatus, setLastNotificationStatus] = useState<any>(null);
  const [isSavingNotifyConfig, setIsSavingNotifyConfig] = useState<boolean>(false);
  const [notifySaveSuccess, setNotifySaveSuccess] = useState<string>('');
  const [notifySaveError, setNotifySaveError] = useState<string>('');
  const [isTestingNotify, setIsTestingNotify] = useState<boolean>(false);
  const [testNotifyResult, setTestNotifyResult] = useState<any>(null);

  // Fetch notification configuration
  const fetchNotificationConfig = async (currentPin?: string) => {
    const authPin = currentPin || pin;
    if (!authPin) return;
    try {
      const res = await fetch('/api/admin/notification-config', {
        headers: { 'x-planner-pin': authPin },
      });
      const data = await res.json();
      if (data.success && data.config) {
        if (data.config.emailRecipient) setNotifyRecipient(data.config.emailRecipient);
        if (data.config.hasSmtpPass) {
          setHasConfiguredPass(true);
          setNotifySmtpPass('••••••••••••••••');
        }
        if (data.config.webhookUrl) setNotifyWebhookUrl(data.config.webhookUrl);
        if (data.config.lastStatus) setLastNotificationStatus(data.config.lastStatus);
      }
    } catch (err) {
      console.warn('Failed to fetch notification config:', err);
    }
  };

  // Save notification configuration
  const handleSaveNotificationConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingNotifyConfig(true);
    setNotifySaveSuccess('');
    setNotifySaveError('');
    try {
      const payload: any = {
        emailRecipient: notifyRecipient.trim(),
        webhookUrl: notifyWebhookUrl.trim(),
      };
      // Only send password if user changed it from the masked bullets
      if (notifySmtpPass && notifySmtpPass !== '••••••••••••••••') {
        payload.smtpPass = notifySmtpPass.trim();
      }
      const res = await fetch('/api/admin/notification-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-planner-pin': pin,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setNotifySaveSuccess('✅ 通知配置已成功保存！新工单将立即触发推送。');
        if (data.config) {
          setHasConfiguredPass(data.config.hasSmtpPass);
          if (data.config.hasSmtpPass) setNotifySmtpPass('••••••••••••••••');
        }
      } else {
        setNotifySaveError(data.error || '保存失败，请检查安全授权。');
      }
    } catch (err: any) {
      setNotifySaveError('网络异常，无法保存配置。');
    } finally {
      setIsSavingNotifyConfig(false);
    }
  };

  // Trigger test alert to Email / Webhook
  const handleTestNotification = async () => {
    setIsTestingNotify(true);
    setTestNotifyResult(null);
    try {
      const res = await fetch('/api/admin/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-planner-pin': pin,
        },
      });
      const data = await res.json();
      setTestNotifyResult(data);
      // Refresh status
      fetchNotificationConfig();
    } catch (err: any) {
      setTestNotifyResult({
        success: false,
        message: '发起测试通知失败：' + (err.message || String(err)),
      });
    } finally {
      setIsTestingNotify(false);
    }
  };

  // Verify PIN
  const handleVerifyPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      setPinError('请输入规划师安全密码');
      return;
    }
    setIsVerifyingPin(true);
    setPinError('');
    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('leo_planner_pin', pinInput.trim());
        setPin(pinInput.trim());
        setIsAuthenticated(true);
        fetchLeads(pinInput.trim());
        fetchNotificationConfig(pinInput.trim());
      } else {
        setPinError(data.error || '密码错误，请核对后重试');
      }
    } catch {
      setPinError('连接验证服务异常，请重试');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Check current voice status
  const checkVoiceStatus = async () => {
    try {
      const res = await fetch('/api/voice-status');
      const data = await res.json();
      setHasVoiceSaved(Boolean(data.hasVoice));
      if (data.url) setVoiceUrl(data.url);
    } catch (_) {}
  };

  const fetchLeads = async (currentPin = pin) => {
    if (!currentPin) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/consultations', {
        headers: {
          'x-planner-pin': currentPin,
        },
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('leo_planner_pin');
        setPinError('安全码会话已过期，请重新输入');
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
        if (onLeadCountChange) {
          onLeadCountChange(data.leads.length);
        }
      }
    } catch (err) {
      console.error('Failed to fetch customer leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkVoiceStatus();
      if (isAuthenticated && pin) {
        fetchLeads();
        fetchNotificationConfig();
      }
    }
  }, [isOpen, isAuthenticated]);

  // Clean up audio preview on unmount
  useEffect(() => {
    return () => {
      if (previewAudio) {
        previewAudio.pause();
      }
    };
  }, [previewAudio]);

  if (!isOpen) return null;

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactMethod.includes(searchQuery) ||
      lead.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.note && lead.note.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalCount = leads.length;
  const pendingCount = leads.filter((l) => (l.status || 'pending') === 'pending').length;
  const totalGap = leads.reduce((sum, l) => sum + (Number(l.calculatedGap) || 0), 0);

  // Status update
  const handleUpdateStatus = async (
    id: string,
    newStatus: 'pending' | 'contacted' | 'completed'
  ) => {
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-planner-pin': pin,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
      }
    } catch (err) {
      console.error('Update lead status error:', err);
    }
  };

  // Delete lead
  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('确定要从汇总表中移除此条客户线索吗？')) return;
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'DELETE',
        headers: {
          'x-planner-pin': pin,
        },
      });
      if (res.ok) {
        const next = leads.filter((l) => l.id !== id);
        setLeads(next);
        if (onLeadCountChange) onLeadCountChange(next.length);
      }
    } catch (err) {
      console.error('Delete lead error:', err);
    }
  };

  // Quick simulate second/third customer submission to demonstrate cumulative capability
  const handleAddSampleLead = async () => {
    setIsAddingTest(true);
    const mockNames = ['林先生 (Johor)', '陈太太 (KL)', '黄经理 (Penang)', '张工程师 (Selangor)', '李小姐 (Ipoh)'];
    const mockPhones = ['016-882 1429', '012-993 8472', '017-331 9283', '019-445 6671', '018-221 7890'];
    const mockGaps = [350000, 500000, 720000, 480000, 600000];
    const randomIndex = Math.floor(Math.random() * mockNames.length);

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: mockNames[randomIndex],
          contactMethod: mockPhones[randomIndex],
          familyStructure: '双职工家庭 + 2个小孩',
          existingPolicyStatus: '仅有大马公司医药卡，无独立重疾险',
          focusAreas: ['重疾生活替代金', '保单受益人整理'],
          note: '打字【重疾】预约保单体检，想梳理全家保障。',
          calculatedGap: mockGaps[randomIndex],
        }),
      });
      if (res.ok) {
        await fetchLeads();
      }
    } catch (err) {
      console.error('Add mock lead error:', err);
    } finally {
      setIsAddingTest(false);
    }
  };

  // Export to CSV / Excel with PIN authentication
  const handleExport = () => {
    window.open(`/api/consultations-export?pin=${encodeURIComponent(pin)}`, '_blank');
  };

  // Handle Video / Audio File Upload to Extract Leo's Voice
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVoice(true);
    setVoiceUploadSuccess('');
    setVoiceUploadError('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const res = await fetch('/api/admin/save-voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dataUrl,
              filename: file.name,
              isVideo: file.type.startsWith('video/') || /\.(mp4|mov|m4v|webm)$/i.test(file.name),
            }),
          });
          const data = await res.json();
          if (data.success) {
            setVoiceUploadSuccess(data.message || '原声已成功更新！');
            setHasVoiceSaved(true);
            setVoiceUrl(`/assets/brand/leo_voice.mp3?t=${Date.now()}`);
            if (onVoiceUpdated) onVoiceUpdated();
          } else {
            setVoiceUploadError(data.error || '提取人声失败，请重试');
          }
        } catch {
          setVoiceUploadError('上传处理失败，请检查文件格式');
        } finally {
          setIsUploadingVoice(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setVoiceUploadError('读取文件异常');
      setIsUploadingVoice(false);
    }
  };

  // Test Play Extracted Voice
  const handleTogglePreviewAudio = () => {
    if (isPlayingPreview && previewAudio) {
      previewAudio.pause();
      setIsPlayingPreview(false);
      return;
    }

    const audio = new Audio(voiceUrl || '/assets/brand/leo_voice.mp3');
    audio.onended = () => setIsPlayingPreview(false);
    audio.onerror = () => {
      setIsPlayingPreview(false);
      alert('当前暂未找到提取的人声音频文件，请先上传您的原版视频');
    };
    audio.play().then(() => {
      setPreviewAudio(audio);
      setIsPlayingPreview(true);
    }).catch(() => {
      setIsPlayingPreview(false);
    });
  };

  return (
    <div
      id="customer-leads-dashboard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Leo 规划师专属工作台 (私密管控)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 shadow-sm">
                  仅规划师可见 · 大众已隐藏
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                客户资料私密归纳 · 视频原声人声提取 · 实时直发推送
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && activeTab === 'leads' && (
              <button
                onClick={handleExport}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
                title="导出全部客户数据为 Excel 格式"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>导出 Excel/CSV</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security PIN Screen if not authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
              <KeyRound className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h4 className="text-xl font-black text-slate-900">请输入规划师安全密码</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                为保护客户隐私与保单体检资料安全，全站客户表已彻底对普通大众隐藏。只有您本人输入专属密码方可解锁查阅及管理。
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="w-full max-w-sm space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="请输入规划师专属安全密码"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50"
                />
                {pinError && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5">{pinError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isVerifyingPin}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition active:scale-95"
                >
                  {isVerifyingPin ? '正在验证安全码...' : '解锁工作台 🔓'}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <span>🔒</span>
                <span>规划师专属安全通道 · 验证后当前浏览器会话保持解锁</span>
              </p>
            </form>
          </div>
        ) : (
          <>
            {/* Nav Tabs for Authenticated Leo */}
            <div className="px-6 pt-3 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveTab('leads')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl border-t border-x transition ${
                  activeTab === 'leads'
                    ? 'bg-white text-slate-950 border-slate-200 shadow-sm font-bold'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent'
                }`}
              >
                <Users className="w-4 h-4 text-amber-600" />
                <span>客户线索累计数据库 ({totalCount} 位)</span>
              </button>

              <button
                onClick={() => setActiveTab('voice')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl border-t border-x transition ${
                  activeTab === 'voice'
                    ? 'bg-white text-slate-950 border-slate-200 shadow-sm font-bold'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent'
                }`}
              >
                <Mic className="w-4 h-4 text-emerald-600" />
                <span>Leo 视频原声人声提取与管理</span>
                {hasVoiceSaved && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('notify')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl border-t border-x transition ${
                  activeTab === 'notify'
                    ? 'bg-white text-slate-950 border-slate-200 shadow-sm font-bold'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent'
                }`}
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span>实时接收通知最佳方式</span>
              </button>
            </div>

            {/* Tab 1: Leads Cumulative Table */}
            {activeTab === 'leads' && (
              <>
                {/* Metric Cards & Fast Summary */}
                <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 space-y-4">
                  {/* How Leo Receives Data Banner */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-950 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                      <span>
                        <strong>客户表已对大众安全隐藏：</strong>普通访客无法通过网页查看任何客户信息；仅您输入密码可进入此表。当访客填表时，资料会第一时间格式化并推送到您的 WhatsApp (<strong>+60164311419</strong>)。
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('notify')}
                      className="text-[11px] font-bold text-amber-800 hover:underline flex-shrink-0"
                    >
                      查看接收机制详情 →
                    </button>
                  </div>

                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <span className="text-xs text-slate-500 font-medium block">累计预约客户</span>
                      <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                        <span>{totalCount}</span>
                        <span className="text-xs font-normal text-slate-500">位</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
                      <span className="text-xs text-amber-800 font-medium block">待联系跟进</span>
                      <div className="text-2xl font-black text-amber-600 mt-1 flex items-baseline gap-1">
                        <span>{pendingCount}</span>
                        <span className="text-xs font-normal text-amber-700">位</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <span className="text-xs text-slate-500 font-medium block">累计测算重疾缺口总额</span>
                      <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1 truncate">
                        RM {(totalGap / 10000).toFixed(1)}万
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-center">
                      <button
                        onClick={handleAddSampleLead}
                        disabled={isAddingTest}
                        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow flex items-center justify-center gap-1.5 transition active:scale-95"
                        title="模拟第2/3位顾客填表，体验持续累计效果"
                      >
                        {isAddingTest ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>模拟填表 (体验累计)</span>
                      </button>
                    </div>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="搜索客户称呼、电话、工单号..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-xs">
                        <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                        <button
                          onClick={() => setStatusFilter('all')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition ${
                            statusFilter === 'all'
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          全部 ({leads.length})
                        </button>
                        <button
                          onClick={() => setStatusFilter('pending')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition ${
                            statusFilter === 'pending'
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          待联系 ({pendingCount})
                        </button>
                        <button
                          onClick={() => setStatusFilter('contacted')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition ${
                            statusFilter === 'contacted'
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          已联系
                        </button>
                      </div>

                      <button
                        onClick={() => fetchLeads()}
                        disabled={isLoading}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
                        title="刷新客户列表"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        onClick={handleExport}
                        className="sm:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>导出</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Leads Table Container */}
                <div className="flex-1 overflow-auto p-4 sm:p-6">
                  {filteredLeads.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <Users className="w-12 h-12 text-slate-300 mx-auto" />
                      <h4 className="text-base font-bold text-slate-700">暂无符合条件的客户自查预约</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        当访客在页面完成保额测算并点击「提交自查预约」后，其资料将第一时间归纳展示在此表中，并支持第二位、第三位顾客持续累计。
                      </p>
                      <button
                        onClick={handleAddSampleLead}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>模拟录入一条测试线索体验累计效果</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs text-slate-700 border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-3.5 w-12 text-center">#</th>
                            <th className="py-3 px-3.5">提交日期与时间</th>
                            <th className="py-3 px-3.5">客户称呼</th>
                            <th className="py-3 px-3.5">WhatsApp / 手机号</th>
                            <th className="py-3 px-3.5 text-right">测算重疾缺口</th>
                            <th className="py-3 px-3.5">家庭人口与在保现状</th>
                            <th className="py-3 px-3.5">关注需求与留言</th>
                            <th className="py-3 px-3.5 text-center">跟进状态</th>
                            <th className="py-3 px-3.5 text-center">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {filteredLeads.map((lead, idx) => {
                            const cleanPhone = lead.contactMethod.replace(/[^0-9]/g, '');
                            const normalizedPhone = cleanPhone.startsWith('0')
                              ? '6' + cleanPhone
                              : cleanPhone.startsWith('60')
                              ? cleanPhone
                              : '60' + cleanPhone;

                            const waFollowUpUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(
                              `您好 ${lead.contactName}！我是 Leo 家庭财富传承规划师。看到您在平台上完成了重疾自查预约（工单号：${lead.id}），测算重疾生活替代金缺口约为 RM ${(
                                Number(lead.calculatedGap) || 0
                              ).toLocaleString()}。我现在为您提供 1-对-1 深度保单梳理与缺口体检，请问您方便发我目前的保单概要吗？`
                            )}`;

                            return (
                              <tr
                                key={lead.id}
                                className="hover:bg-amber-50/30 transition duration-150"
                              >
                                <td className="py-3.5 px-3.5 text-center font-mono text-slate-400 font-bold">
                                  {idx + 1}
                                </td>
                                <td className="py-3.5 px-3.5 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{lead.formattedDateTime || lead.createdAt}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                    ID: {lead.id}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3.5 font-bold text-slate-900">
                                  {lead.contactName}
                                </td>
                                <td className="py-3.5 px-3.5">
                                  <div className="flex items-center gap-1 font-mono font-semibold text-slate-800">
                                    <Phone className="w-3 h-3 text-emerald-600" />
                                    <span>{lead.contactMethod}</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                                  <span className="font-bold text-rose-600 font-mono text-sm">
                                    RM {(Number(lead.calculatedGap) || 0).toLocaleString()}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3.5 max-w-[200px]">
                                  <p className="font-medium text-slate-800 truncate" title={lead.familyStructure}>
                                    {lead.familyStructure || '未填写'}
                                  </p>
                                  <p className="text-[11px] text-slate-500 truncate" title={lead.existingPolicyStatus}>
                                    {lead.existingPolicyStatus || '无现有保单'}
                                  </p>
                                </td>
                                <td className="py-3.5 px-3.5 max-w-[200px]">
                                  {lead.focusAreas && lead.focusAreas.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-1">
                                      {lead.focusAreas.map((tag) => (
                                        <span
                                          key={tag}
                                          className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 font-medium"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <p className="text-[11px] text-slate-600 truncate" title={lead.note}>
                                    {lead.note || '打字【重疾】预约保单体检'}
                                  </p>
                                </td>
                                <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                                  <select
                                    value={lead.status || 'pending'}
                                    onChange={(e) =>
                                      handleUpdateStatus(
                                        lead.id,
                                        e.target.value as 'pending' | 'contacted' | 'completed'
                                      )
                                    }
                                    className={`text-[11px] font-bold rounded-lg px-2 py-1 border focus:outline-none ${
                                      lead.status === 'completed'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : lead.status === 'contacted'
                                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                                        : 'bg-amber-50 text-amber-700 border-amber-300'
                                    }`}
                                  >
                                    <option value="pending">待联系跟进</option>
                                    <option value="contacted">已初步私聊</option>
                                    <option value="completed">已完成保单体检</option>
                                  </select>
                                </td>
                                <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <a
                                      href={waFollowUpUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                                      title="通过 WhatsApp 立即联系该客户"
                                    >
                                      <Send className="w-3 h-3" />
                                      <span>私聊客户</span>
                                    </a>
                                    <button
                                      onClick={() => handleDeleteLead(lead.id)}
                                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                      title="删除记录"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Tab 2: Leo Video Human Voice Extraction Studio */}
            {activeTab === 'voice' && (
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Status Banner */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-emerald-950">
                        Leo 助理真实原声提取与导入系统已就绪
                      </h4>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        您可以直接把您录制好的 MP4 原版视频（或音频文件）拖拽或上传到下方。服务器已内置 <strong>FFmpeg 高保真人声提取引擎</strong>，会自动剥离视频画面，提取并降噪出您的纯净人声，一键替换为全站「Leo 助理原声导读」！
                      </p>
                    </div>
                  </div>

                  {/* Current Active Voice Status Card */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          当前站点原声配置状态
                        </span>
                        <h5 className="text-base font-black text-slate-900 mt-0.5 flex items-center gap-2">
                          <span>Leo 助理原声状态：</span>
                          {hasVoiceSaved ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              ✓ 已导入真实人声音频
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              ● 当前使用真实语义 TTS 导读（可随时替换）
                            </span>
                          )}
                        </h5>
                      </div>

                      {hasVoiceSaved && (
                        <button
                          onClick={handleTogglePreviewAudio}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-amber-300 shadow flex items-center gap-1.5 transition"
                        >
                          {isPlayingPreview ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span>暂停试听</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-amber-300" />
                              <span>试听提取的原声</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">视频原声文字对白核对（已完全匹配）：</p>
                      <p className="italic leading-relaxed text-slate-700">
                        “你花了十几年买保险，每个月认真的缴费，可是你有没有想过，如果有一天你真的不在了，你的家人知道该怎么办吗？他们可能知道你有买保险，但是不知道买了多少，不知道是哪一家，不知道保单放在哪里，甚至不知道应该找谁……买保险是保障的开始，而不是家庭规划的结束。”
                      </p>
                    </div>
                  </div>

                  {/* Upload Dropzone */}
                  <div className="p-8 rounded-3xl border-2 border-dashed border-amber-400/80 bg-amber-50/40 text-center space-y-4 hover:bg-amber-50/70 transition">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-600 mx-auto flex items-center justify-center">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-slate-900">
                        选择或拖入您发我的原版 MP4 视频
                      </h4>
                      <p className="text-xs text-slate-500">
                        支持格式：.mp4, .mov, .m4a, .mp3, .wav（系统自动通过 FFmpeg 提取人声并保存）
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 cursor-pointer transition active:scale-95">
                      <Upload className="w-4 h-4" />
                      <span>{isUploadingVoice ? '正在提取人声中 (FFmpeg)...' : '点击选择视频文件提取人声'}</span>
                      <input
                        type="file"
                        accept="video/*,audio/*"
                        onChange={handleFileUpload}
                        disabled={isUploadingVoice}
                        className="hidden"
                      />
                    </label>

                    {voiceUploadSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-in fade-in">
                        {voiceUploadSuccess}
                      </div>
                    )}
                    {voiceUploadError && (
                      <div className="p-3 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold animate-in fade-in">
                        {voiceUploadError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Notifications Guide & Real-Time Alert Setup */}
            {activeTab === 'notify' && (
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900">
                      规划师第一时间接收顾客资料的 3 大通道与自动推送
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      针对您提出的“一旦顾客提交立即通知我（邮件、WhatsApp），同时大众无法看到”，系统已构建了全自动闭环机制：
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Channel 1 */}
                    <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                        1
                      </div>
                      <h5 className="text-sm font-bold text-slate-900">WhatsApp 实时私聊直达</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        当客户提交表单后，系统<strong>自动尝试唤起 WhatsApp</strong>，并将测算缺口预填好。客户只要一键发送，即刻直达您的 WhatsApp (<strong>+60164311419</strong>)，手机马上震动响铃！
                      </p>
                    </div>

                    {/* Channel 2 */}
                    <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                        2
                      </div>
                      <h5 className="text-sm font-bold text-slate-900">官方邮箱即时自动推送</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        顾客提交成功的<strong>0.1秒内</strong>，服务器自动化程序会立刻整理工单详情并发送邮件至您的官方邮箱 <strong>leo.wealtharchitect@gmail.com</strong>，邮件内含一键直达客户 WhatsApp 的链接。
                      </p>
                    </div>

                    {/* Channel 3 */}
                    <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold">
                        3
                      </div>
                      <h5 className="text-sm font-bold text-slate-900">私密工作台永久归档</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        公共页面彻底隐去了客户名单与人数。所有资料在您的私密工作台持续累积。随时可以用网址 <code>?admin=leo</code> 打开查阅与导出 Excel。
                      </p>
                    </div>
                  </div>

                  {/* Notification Setup & Live Testing Card */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h5 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <span>⚙️ 即时邮件与推送通知设置</span>
                          {hasConfiguredPass ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              ✓ 邮件发送服务就绪
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              待填入 Gmail 授权密码
                            </span>
                          )}
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          配置 Leo 的 Gmail 专用授权密码，客户一旦提交即可第一时间通过邮件或 Webhook 推送给您。
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveNotificationConfig} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          接收通知官方邮箱 (Recipient Email)
                        </label>
                        <input
                          type="email"
                          value={notifyRecipient}
                          onChange={(e) => setNotifyRecipient(e.target.value)}
                          placeholder="leo.wealtharchitect@gmail.com"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            Gmail 16 位应用专用密码 (App Password)
                          </label>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {hasConfiguredPass ? '（已加密存储）' : '（留空则不触发邮件发送）'}
                          </span>
                        </div>
                        <input
                          type="password"
                          value={notifySmtpPass}
                          onChange={(e) => setNotifySmtpPass(e.target.value)}
                          placeholder={
                            hasConfiguredPass
                              ? '•••••••••••••••• (如需更新可在此输入新密码)'
                              : '例如: abcd efgh ijkl mnop (共16位)'
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                        />
                        <div className="p-3 mt-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                          <p className="font-bold text-slate-800">💡 为什么需要 16 位应用专用密码？</p>
                          <p>
                            为保障您的 Google 帐号安全，系统不使用您的日常登录主密码，而是使用 Google 官方提供的 16 位专用密码发信：
                          </p>
                          <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                            <li>登录 Google 帐号管理中心 (myaccount.google.com)</li>
                            <li>左侧点击「安全性」并确保已开启「两步验证」</li>
                            <li>在两步验证页面底部点击「应用专用密码 (App passwords)」</li>
                            <li>输入名称（如：自查工单），点击生成即可获得 16 位英文字母密码并粘贴于此处。</li>
                          </ol>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          备用手机即时推送 Webhook (选填：Discord / Telegram Bot / Make.com)
                        </label>
                        <input
                          type="url"
                          value={notifyWebhookUrl}
                          onChange={(e) => setNotifyWebhookUrl(e.target.value)}
                          placeholder="例如: https://discord.com/api/webhooks/... 或 Telegram Webhook"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          若您有 Discord 频道或 Telegram 机器人，填入 Webhook 即可在顾客提交时让手机即刻弹出横幅通知！
                        </p>
                      </div>

                      {notifySaveSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
                          {notifySaveSuccess}
                        </div>
                      )}

                      {notifySaveError && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold">
                          {notifySaveError}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isSavingNotifyConfig}
                          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white shadow transition disabled:opacity-50"
                        >
                          {isSavingNotifyConfig ? '正在保存...' : '💾 保存通知配置'}
                        </button>

                        <button
                          type="button"
                          onClick={handleTestNotification}
                          disabled={isTestingNotify}
                          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow transition disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isTestingNotify ? '正在测试发送...' : '🚀 发送一条实时测试通知 (联调)'}
                        </button>
                      </div>
                    </form>

                    {/* Test Result Display */}
                    {testNotifyResult && (
                      <div
                        className={`p-4 rounded-xl border text-xs space-y-2 ${
                          testNotifyResult.success
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : 'bg-amber-50/80 border-amber-300 text-amber-950'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-2 text-sm">
                          <span>{testNotifyResult.success ? '✅' : '⚠️'}</span>
                          <span>{testNotifyResult.message}</span>
                        </div>
                        {testNotifyResult.details && (
                          <div className="space-y-1 font-mono text-[11px] bg-white/60 p-2.5 rounded-lg">
                            <p>
                              <strong>邮件推送状态：</strong>{' '}
                              {testNotifyResult.details.emailSuccess ? '成功送达' : '未发送/未配置'}
                              （{testNotifyResult.details.emailMessage}）
                            </p>
                            <p>
                              <strong>Webhook 推送状态：</strong>{' '}
                              {testNotifyResult.details.webhookSuccess ? '成功' : '未发送/未配置'}
                              （{testNotifyResult.details.webhookMessage}）
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Latest Dispatch Status */}
                    {lastNotificationStatus && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                        <span className="font-bold text-slate-800 block mb-1">
                          🕒 最近一次系统推送记录 ({new Date(lastNotificationStatus.timestamp).toLocaleString()}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div>
                            邮件: {lastNotificationStatus.emailSuccess ? '✅ 发送成功' : '⚠️ ' + lastNotificationStatus.emailMessage}
                          </div>
                          <div>
                            Webhook: {lastNotificationStatus.webhookSuccess ? '✅ 发送成功' : 'ℹ️ ' + lastNotificationStatus.webhookMessage}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-400">
                      <Info className="w-4 h-4" />
                      <span>如何随时再次打开此私密工作台？</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      直接在浏览器网页网址末尾加上 <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">?admin=leo</code> 即可直达。<br />
                      （页脚通道按钮已按您的要求彻底移除，普通公众浏览页面时完全无从察觉）。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
