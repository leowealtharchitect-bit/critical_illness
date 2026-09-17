import React, { useState } from 'react';
import {
  X,
  MessageSquareHeart,
  Send,
  CheckCircle2,
  ShieldCheck,
  User,
  Phone,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { COMMUNITY_DISCUSSIONS } from '../data/insuranceContent';
import { ConsultationRequest } from '../types';
import { useLeoAvatar } from '../context/AvatarContext';

interface PolicyConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatedGap: number;
  onLeadSubmitted?: () => void;
}

export const PolicyConsultModal: React.FC<PolicyConsultModalProps> = ({
  isOpen,
  onClose,
  calculatedGap,
  onLeadSubmitted,
}) => {
  const { avatarUrl } = useLeoAvatar();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [familyStructure, setFamilyStructure] = useState('三口之家 (夫妻+1孩)');
  const [policyStatus, setPolicyStatus] = useState('仅买了医药卡/医疗险，无重疾');
  const [focusAreas, setFocusAreas] = useState<string[]>([
    '测算家庭支柱真正需要的重疾保额',
    '梳理现有保单是否有重复或免赔盲区',
  ]);
  const [note, setNote] = useState('【重疾】想做一次免费家庭保障自查，看看我们家保额到底够不够！');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [waDispatchUrl, setWaDispatchUrl] = useState<string>('');
  const [waAutoLaunched, setWaAutoLaunched] = useState<boolean>(false);

  // Community discussion state
  const [comments, setComments] = useState(COMMUNITY_DISCUSSIONS);
  const [newComment, setNewComment] = useState('');

  if (!isOpen) return null;

  const toggleFocus = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter((item) => item !== area));
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || isSubmitting) return;

    setIsSubmitting(true);
    const fallbackTicket = 'LEO-' + Date.now().toString().slice(-6);

    try {
      // 1. Post to backend cumulative storage & instant notification
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: name,
          contactMethod: contact,
          familyStructure,
          existingPolicyStatus: policyStatus,
          focusAreas,
          note,
          calculatedGap,
        }),
      });

      const data = await res.json();
      let waTarget = '';
      if (data.success && data.lead) {
        setTicketId(data.lead.id);
        if (data.waNotificationUrl) {
          waTarget = data.waNotificationUrl;
          setWaDispatchUrl(data.waNotificationUrl);
        }
      } else {
        setTicketId(fallbackTicket);
        waTarget = `https://wa.me/60164311419?text=${encodeURIComponent(
          `Hi Leo, 我在你的家庭保障自查系统完成了测算（工单号: ${fallbackTicket}，称呼: ${name}，电话: ${contact}），想向你咨询保单梳理！`
        )}`;
        setWaDispatchUrl(waTarget);
      }

      // Automatically attempt to launch WhatsApp to send lead directly to Leo
      if (waTarget && typeof window !== 'undefined') {
        try {
          const win = window.open(waTarget, '_blank');
          if (win) {
            setWaAutoLaunched(true);
          }
        } catch {
          // Blocked by popup blocker
        }
      }

      // 2. Client-side backup
      try {
        const stored = localStorage.getItem('insurance_consultations');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({
          id: data?.lead?.id || fallbackTicket,
          contactName: name,
          contactMethod: contact,
          familyStructure,
          existingPolicyStatus: policyStatus,
          focusAreas,
          note,
          calculatedGap,
          createdAt: new Date().toLocaleString(),
        });
        localStorage.setItem('insurance_consultations', JSON.stringify(list));
      } catch (err) {
        console.warn('Storage error', err);
      }

      if (onLeadSubmitted) {
        onLeadSubmitted();
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Lead submission error:', err);
      setTicketId(fallbackTicket);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    const item = {
      author: name ? `${name}（大马自查用户）` : '大马网友（已自查）',
      tag: '已自查 · 打字【重疾】',
      time: '刚刚',
      comment: newComment,
      response: '已收到您的自查意向！规划师 Leo 将通过 WhatsApp 为您提供大马家庭保单梳理。',
    };
    setComments([item, ...comments]);
    setNewComment('');
  };

  return (
    <div
      id="policy-consult-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="policy-consult-modal-content"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-3.5">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full ring-2 ring-amber-400 overflow-hidden bg-slate-900 shadow-md">
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
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                  <span>Leo</span>
                  <span className="text-xs font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                    家庭财富传承规划师
                  </span>
                </h3>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                工程师思维 × 幸福财富传承 · 1-对-1 免费大马保单深度梳理
              </p>
            </div>
          </div>

          <button
            id="modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              {/* Leo Crowned Avatar */}
              <div className="relative inline-block mx-auto">
                <div className="w-20 h-20 rounded-full ring-4 ring-amber-400 p-0.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-xl">
                  <img
                    src={avatarUrl}
                    alt="Leo 家庭财富传承规划师"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top rounded-full bg-slate-900"
                  />
                </div>
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xl">👑</span>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow">
                  ✓
                </span>
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">Leo 规划师已收到您的自查意向！</h4>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  工程师思维 × 幸福财富传承 · 1-对-1 免费大马保单深度梳理
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm max-w-md mx-auto">
                <span className="text-xs text-slate-500 block">您的专属自查预约工单号：</span>
                <span className="font-mono font-black text-amber-700 text-xl block mt-0.5">
                  {ticketId}
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  尊敬的 <strong className="text-slate-800">{name}</strong>，您的自查资料已自动汇总并第一时间通知 Leo，Leo 将尽快通过 WhatsApp 与您联系。
                </p>
              </div>

              {/* WhatsApp Action Alert */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 max-w-md mx-auto text-left flex items-start gap-2">
                <span className="text-base">📲</span>
                <div>
                  <strong className="block font-bold text-emerald-950">
                    {waAutoLaunched
                      ? '已自动为您启动 WhatsApp 与 Leo 对话！'
                      : '请一键将工单发送至 Leo 规划师 WhatsApp'}
                  </strong>
                  <span className="text-emerald-800 text-[11px] leading-tight block mt-0.5">
                    工单已备好测算缺口。请点击下方绿色按钮，直接将工单发送至 Leo 的 WhatsApp（+60164311419），Leo 即可第一时间收到并优先为您梳理！
                  </span>
                </div>
              </div>

              {/* Direct WhatsApp Message Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto pt-1">
                <a
                  href={
                    waDispatchUrl ||
                    `https://wa.me/60164311419?text=${encodeURIComponent(
                      `Hi Leo (家庭财富传承规划师), 我在你的家庭保障自查系统完成了保额测算（工单号: ${ticketId}，称呼: ${name}，电话: ${contact}），想向你请教如何梳理我们家的保单和重疾生活替代金！`
                    )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition ring-2 ring-emerald-400/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="animate-bounce">💬</span>
                  <span>立即 WhatsApp (+60164311419) 发送给 Leo</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  关闭窗口
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-left text-xs text-amber-900 space-y-1 max-w-md mx-auto">
                <p className="font-bold flex items-center gap-1">
                  <span>📋 Leo 的自查准备建议：</span>
                </p>
                <p>1. 准备好目前在保的大马保单（核对受保人、重疾险种与保额 RM）</p>
                <p>2. 重点排查：全家是否仅有医药卡（实报实销付给医院），而缺乏大病休养的生活替代金现金</p>
              </div>
            </div>
          ) : (
            <>
              {/* Trust banner encouraging lead submission */}
              <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span>
                  <strong>家庭自查指引：</strong>请填写下方基本信息，提交后自动归入专属自查工单，Leo 将为您深度梳理保单与保额缺口。
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      您的称呼 *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="例如：陈女士 / 林先生"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp 号码 / 手机号 *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="例如：012-345 6789 (WhatsApp)"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      家庭常住人口结构
                    </label>
                    <select
                      value={familyStructure}
                      onChange={(e) => setFamilyStructure(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      <option>单身独立打拼</option>
                      <option>新婚二人世界</option>
                      <option>三口之家 (夫妻+1孩)</option>
                      <option>四口及以上 (二胎/三代同堂)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      目前现有大马保单情况
                    </label>
                    <select
                      value={policyStatus}
                      onChange={(e) => setPolicyStatus(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      <option>完全没有买过商业保险 (裸奔状态)</option>
                      <option>仅有医药卡 (Medical Card)，无重疾险</option>
                      <option>买了重疾险，但不清楚保额 RM 够不够</option>
                      <option>有多家保险公司保单，想梳理是否有重叠或漏洞</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    您最希望自查梳理的重点（可多选）
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      '测算家庭支柱真正需要的重疾保额 (RM)',
                      '已有 Medical Card，分析需要多少生活替代金',
                      '梳理现有大马保单是否有重复或免赔漏洞',
                      '合理优化保费预算，把每一令吉花在刀刃上',
                    ].map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleFocus(area)}
                        className={`text-left px-3 py-2 rounded-xl text-xs border transition flex items-center gap-2 ${
                          focusAreas.includes(area)
                            ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            focusAreas.includes(area) ? 'text-amber-600' : 'text-slate-300'
                          }`}
                        />
                        <span>{area}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    自查留言（已自动带入【重疾】）
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition shadow flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>
                    {isSubmitting
                      ? '正在自动归纳资料并推送给 Leo...'
                      : '一键打字【重疾】· 提交 WhatsApp 免费自查预约'}
                  </span>
                </button>
              </form>

              {/* Community Interactive Wall */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      💬 评论区自查互动墙 (打字【重疾】精选)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      热烈自查中
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {comments.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{item.author}</span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.comment}</p>
                      {item.response && (
                        <div className="mt-1 pt-1 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-start gap-1">
                          <span className="font-semibold text-amber-800 flex-shrink-0">顾问回复:</span>
                          <span>{item.response}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick comment input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="我也在评论区打字【重疾】..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handlePostComment}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex-shrink-0"
                  >
                    发表
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
