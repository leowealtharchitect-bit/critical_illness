import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Shield, AlertCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  highlight?: string;
}

const FAQ_LIST: FaqItem[] = [
  {
    q: '我明明在大马买了每年 100 万或 200 万保额的医药卡 (Medical Card)，为什么还要买重疾险？',
    a: '医药卡解决的是「看病的钱」，重疾险解决的是「活下去的钱」。在马来西亚，医药卡是凭保证信（GL）或账单收据直接支付给私人医院，解决住院与手术费，你个人一分钱现金都拿不到。但重疾确诊后通常需要 1~3 年的漫长休养，期间工作暂停无收入，但每个月的房贷车贷、孩子国际学校/华小独中学费、家庭柴米油盐不会停，医院更不会给你报销生活费！重疾险赔付的数十万马币（RM）大笔现金，正是维持全家正常运转的“生活替代金”。',
    highlight: '医药卡保医院账单，重疾险保家庭现金流。',
  },
  {
    q: '在大马生病，大病休养为什么要特别算 1~3 年的收入替代金？',
    a: '重大疾病（如癌症、心脑血管中风、重度器官衰竭等）术后有漫长的调理、标靶用药及静养过程，医学上将术后 3~5 年称为关键康复期。在此期间，不仅患者本人无法高强度工作，往往还需要配偶或家人半职或全职照顾。如果不准备 1~3 年的生活替代金，大马家庭很容易被迫动用辛苦积累的 EPF 退休公积金，甚至被迫折价抛售房产。',
    highlight: '大病康复期收入为零，刚性支出翻倍。',
  },
  {
    q: '在马来西亚，家庭重疾保额到底买多少 RM 才算够？',
    a: '科学的保额计算公式为：建议重疾保额 = (月度家庭日常刚性开销 + 月度房贷车贷) × 12 × 3年 + 专项护理与营养储备。对于居住在巴生河流域（雪隆）、槟城或柔佛新山等大马主要城市的中产家庭，通常建议经济支柱的重疾保额不少于 RM 300,000 至 RM 500,000 以上，确保一旦突发风险降临，家庭供房不违约、孩子学业不降级。',
    highlight: '买保险买的就是保额，保额不够等于没买。',
  },
  {
    q: '政府医院（GH）和私人医院（Private Hospital）在保障规划上有什么讲究？',
    a: '正如 Leo 在视频中所分享：马来西亚政府医院虽然医疗收费亲民，但资源高度紧张、排期较长，且许多先进耗材（如骨折钢板器材等需自费 RM 5,000~8,000）；私人医院环境与速度虽好，但需依赖高保额医药卡出具保证信（GL）才能零现金入院。然而两者都无法解决出院后的休养生活费！这就是为什么“医药卡 + 重疾险”是不可分割的双重安全网。',
    highlight: '政府医院省医药费但耗材自费且排期长；私人医院要医药卡，但两者都不包生活费。',
  },
  {
    q: '如果全家保费预算有限，在大马应该优先给谁配置重疾险？',
    a: '家庭投保的核心黄金法则是：「先大人，后小孩；先支柱，后次要」。很多大马父母第一时间把所有预算都给孩子买最好的保险，自己却毫无防护裸奔，这是极其危险的本末倒置。父母才是孩子最坚实的保护伞！只要家庭主要经济主力健康稳固，孩子的生活与教育就有保障。',
    highlight: '先保赚钱的人，再保花钱的人。',
  },
  {
    q: '为什么说“买保险不是因为害怕，而是因为爱”？',
    a: '买保险从来不是为了发财，也不是因为焦虑，而是因为对家人深深的爱与责任。我们在顺风顺水时为家庭构筑起防线，是为了在万一遭遇暴风骤雨时，家人不必低声下气向亲友筹款，不必被迫清空多年积蓄，让家庭永远拥有选择权和重新站起来的底气。',
    highlight: '规划财富的从来不只是钱，而是守护家人的底气。',
  },
];

export const EducationalFaq: React.FC<{ onOpenConsult: () => void }> = ({ onOpenConsult }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold tracking-wider text-amber-800 uppercase px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
          认知破局 · 避坑指南
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-3">
          重疾保障常见盲区与深度解答
        </h2>
        <p className="text-slate-700 mt-2 text-sm sm:text-base">
          看清真实理赔逻辑，把每一分保费都花在刀刃上
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {FAQ_LIST.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden transition shadow-sm hover:border-amber-200"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 transition hover:bg-slate-50/50"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    Q{idx + 1}
                  </span>
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {item.q}
                  </span>
                </div>
                <div className="text-slate-400 flex-shrink-0">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 sm:px-6 pt-0 text-slate-700 text-sm leading-relaxed border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
                  <p className="pt-4">{item.a}</p>
                  {item.highlight && (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>关键认知：{item.highlight}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onOpenConsult}
          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800 transition"
        >
          <span>对现有保单条款有疑问？点击打字【重疾】为您免费梳理保单 📩</span>
        </button>
      </div>
    </section>
  );
};
