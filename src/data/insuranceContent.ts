import { VoiceOption, CalculatorState, CalculationResult, LeoBrandPillar } from '../types';

export const LEO_BRAND_INFO = {
  name: 'Leo',
  title: '家庭财富传承规划师',
  titleEn: 'Wealth Advisor',
  coreTagline: '工程师思维 × 幸福财富传承',
  slogan: '规划现在 · 守护未来',
  subSlogan: '用心守护 传承每一个家',
  visionEn: 'A Brighter Legacy Together',
  missionQuote: '一个更强大的马来西亚，始于每一个更稳固的家庭。',
  mindsetIntro: '以工程师的严谨逻辑与数学模型，为马来西亚家庭搭建确定性底盘，拆解现金流断裂风险，拒绝贩卖焦虑，用科学数据守护家庭资产与幸福。',
  badgeText: '帮助家庭建立保障与财富传承系统',
  portraitUrl: '/assets/brand/leo_portrait.jpg',
  bannerUrl: '/assets/brand/leo_banner.jpg',
};

export const LEO_FIVE_PILLARS: LeoBrandPillar[] = [
  {
    id: 'pillar-medical',
    number: '01',
    title: '医疗保障',
    slogan: '守护健康',
    description: '私人医院医药卡（Medical Card）与保证信（GL）零现金入院，精准防御高额医疗与手术开销。',
    isCurrentToolCore: true,
    color: 'emerald',
  },
  {
    id: 'pillar-ci',
    number: '02',
    title: '保险规划',
    slogan: '守护家人',
    description: '重疾生活替代金与家庭经济支柱收入保障，大病停工 3 年房贷车贷不逾期、生活不降级。（本测算器重点！）',
    isCurrentToolCore: true,
    color: 'amber',
  },
  {
    id: 'pillar-trust',
    number: '03',
    title: '信托规划',
    slogan: '守护资产',
    description: '家庭保险信托与专属资金隔离，专款专用，防范因突发意外或债务导致家庭现金流被依法冻结。',
    color: 'blue',
  },
  {
    id: 'pillar-will',
    number: '04',
    title: '遗嘱规划',
    slogan: '守护意愿',
    description: '合法合规确立家庭心意与财产意愿，避免冗长复杂的法律继承纠纷，让对家人的爱完整无争议送达。',
    color: 'purple',
  },
  {
    id: 'pillar-legacy',
    number: '05',
    title: '财富传承系统',
    slogan: '守护未来',
    description: '构建跨代际幸福财富传承闭环，结合税法、法律与金融工具，实现家庭世代底盘稳固与家道长青。',
    color: 'rose',
  },
];

export const LEO_WHATSAPP_NUMBER = '+60164311419';
export const LEO_WHATSAPP_LINK = 'https://wa.me/60164311419';

export const LEO_VOICE_INFO: VoiceOption = {
  id: 'Leo',
  name: 'Leo 助理原声导读',
  description: 'Leo 官方专属助理 · 专为大马家庭打造的温和理性、条理清晰的原声导读',
  gender: 'male',
  badge: 'Leo 助理',
};

export const AVAILABLE_VOICES: VoiceOption[] = [LEO_VOICE_INFO];

export const LEO_VIDEO_INSIGHT = `你花了十几年买保险，每个月认真的缴费，可是你有没有想过，如果有一天，你真的不在了，你的家人知道该怎么办吗？他们可能知道你有买保险，但是不知道买了多少，不知道是哪一家，不知道保单放在哪里，甚至不知道应该找谁。你看你以为你已经把保障做好了，可是从家庭的角度来看，可能只完成了一半。因为保险的真正意义，不是你买下来的那一天，而是风险发生以后，家人能不能真正的用到。买保险是保障的开始，而不是家庭规划的结束。所以检查三个东西：第一、受益安排有没有整理？第二、家人知道保单在哪里吗？第三、发生事情以后，他们知道应该找谁吗？这三个问题，比你买几张保单更值得检查哦。如果你想自己检查一次现有的保单，留言保单，我可以给你一个简单的检查方向。`;

export const CORE_ESSAY_TEXT = `真正毁掉一个家庭的，很多时候不是贫穷，而是当突发风险发生时，全家完全没有任何准备。在马来西亚，很多人以为自己买了医药卡（Medical Card）就万无一失，但事实是：医药卡，是帮我们把钱付给医院，解决住院和手术的账单；而重疾险（Critical Illness），是一旦确诊重大疾病，保险公司直接赔付给你个人的一大笔现金。为什么重疾险对一个大马家庭这么重要？第一，替代中断的收入：大病休养的一到三年里，工作和薪水停了，但房贷、车贷、孩子的学费和一家人的日常开销不会停，重疾险赔款就是你的生活替代金；第二，保护多年辛苦打拼积累的公积金与资产：不需要在关键时刻被迫清空银行存款、动用养老储备，甚至低价抛售变卖房产来筹备生活费；第三，留住重新站起来的底气：财富规划规划的从来不只是钱，而是在风险来临时，让家庭依然拥有选择权和重新开始的底气。买保险不是因为害怕，而是因为爱。`;

export const THREE_PILLARS = [
  {
    id: 'pillar-1',
    num: '1',
    title: '替代中断的收入',
    subtitle: '大病康复期的「生活替代金」',
    description: '大病休养的 1~3 年里，工作和收入停了，但大马家庭每月的房贷、车贷、孩子学费和日常开销不会停。重疾险赔款就是托底的生活替代金。',
    badge: '生活不停摆',
    iconName: 'TrendingDown',
    details: [
      '弥补患者及陪护家人 1~3 年薪资中断损失',
      '房贷（Housing Loan）与车贷（Car Loan）按月照常偿还',
      '孩子教育不降级，家庭生活品质不滑坡',
    ],
  },
  {
    id: 'pillar-2',
    num: '2',
    title: '保护多年积累的资产',
    subtitle: '避免因病清空 EPF 公积金与储蓄',
    description: '不需要在关键时刻被迫清空多年辛劳攒下的银行储蓄，更不需要为了筹措后期的康复护理费与生活费，被迫在低位折价变卖房产或透支养老金。',
    badge: '资产防火墙',
    iconName: 'ShieldCheck',
    details: [
      '守住多年积累的理财、房产与 EPF 养老底本',
      '不用向亲友低头借债筹钱，免受人情冷暖',
      '特效用药与专人看护有独立保额资金池支付',
    ],
  },
  {
    id: 'pillar-3',
    num: '3',
    title: '留住重新站起来的底气',
    subtitle: '让大马家庭在风暴中依然保有选择权',
    description: '财富规划规划的从来不只是冰冷的数字，而是在突发风浪来临时，让家庭依然拥有选择权和从容重新开始的底气。买保险不是因为害怕，而是因为爱。',
    badge: '尊严与选择权',
    iconName: 'HeartHandshake',
    details: [
      '拥有安心休养 1~3 年、不急于带病返岗的底气',
      '在大马私人医院只选优质医疗方案，不向费用妥协',
      '把对家人的爱与责任转化为法律保单层面的确定承诺',
    ],
  },
];

export const COMPARISON_DATA = {
  medicalCard: {
    name: '医药卡 (Medical Card / 医疗险)',
    tag: '解决医院治疗手术账单',
    recipient: '由保险公司直接结算付给医院（凭保证信 GL 或凭收据报销）',
    nature: '费用补偿型（实报实销，不能超过医院实际开销）',
    purpose: '解决入院押金、手术费、病房费、ICU、指定化疗标靶药账单',
    limitations: '出院后的居家休养、误工收入损失、每月房贷车贷与家庭生活费一分都不赔',
    analogy: '像家庭的「消防水枪」，负责扑灭医院账单的熊熊明火',
    color: 'emerald',
  },
  criticalIllness: {
    name: '重疾险 (Critical Illness Insurance)',
    tag: '确诊直接赔付大笔现金到个人账户',
    recipient: '直接打入受保人个人银行户口，100% 自由支配',
    nature: '定额给付型（符合大病定义一次性赔付约定保额，无需看医院收据）',
    purpose: '作为 1~3 年家庭生活替代金、供车供楼、子女教育费、长期营养与看护开支',
    limitations: '需达到保单重大疾病定义；与医药卡是不可或缺的「黄金搭档」',
    analogy: '像家庭的「紧急备用蓄水池」，在家庭断粮断水时源源不断维持运转',
    color: 'amber',
  },
};

export function calculateCoverage(state: CalculatorState): CalculationResult {
  const {
    monthlyLiving,
    monthlyDebt,
    annualEducation,
    recoveryYears,
    specialCare,
    existingCoverage,
    emergencyFund,
  } = state;

  const incomeReplacement = monthlyLiving * 12 * recoveryYears;
  const debtCoverage = monthlyDebt * 12 * recoveryYears;
  const educationFund = annualEducation * recoveryYears;
  const specialCareFund = specialCare;

  const suggestedCoverage = incomeReplacement + debtCoverage + educationFund + specialCareFund;
  const gap = Math.max(0, suggestedCoverage - existingCoverage);

  // Calculate resilience score: based on coverage ratio and emergency fund
  const totalProtection = existingCoverage + emergencyFund * 0.5;
  let ratio = suggestedCoverage > 0 ? (totalProtection / suggestedCoverage) : 1;
  if (ratio > 1) ratio = 1;
  const resilienceScore = Math.round(ratio * 100);

  let riskLevel: 'critical' | 'warning' | 'adequate' | 'excellent' = 'adequate';
  let riskTitle = '保障基本健全';
  let riskDescription = '您已具备一定的风险防御基础，但仍建议针对家庭主要经济支柱的收入替代缺口适度补足。';

  if (resilienceScore < 40) {
    riskLevel = 'critical';
    riskTitle = '家庭风险敞口极高';
    riskDescription = '一旦发生重大疾病，现有保额与存款难以支撑半年以上房贷与生活刚需，极易面临资产变卖或债务风险。';
  } else if (resilienceScore < 70) {
    riskLevel = 'warning';
    riskTitle = '存在明显保额缺口';
    riskDescription = '现有保障仅能应对短期基础开销，在面对 2~3 年的长期停工休养及房贷车贷时仍有较大资金压力。';
  } else if (resilienceScore < 90) {
    riskLevel = 'adequate';
    riskTitle = '保障较为充沛';
    riskDescription = '家庭安全缓冲带较稳健，能有效抵御大部分因病停工导致的收入中断，建议定期做保单条款与免赔梳理。';
  } else {
    riskLevel = 'excellent';
    riskTitle = '家庭保障坚如磐石';
    riskDescription = '重疾保额储备充足，具备优异的抗风险与生活替代能力，家庭财富与家人生活品质拥有强韧防御网。';
  }

  return {
    incomeReplacement,
    debtCoverage,
    educationFund,
    specialCareFund,
    suggestedCoverage,
    gap,
    resilienceScore,
    riskLevel,
    riskTitle,
    riskDescription,
  };
}

export const COMMUNITY_DISCUSSIONS = [
  {
    author: '林先生（35岁·吉隆坡 IT工程师）',
    tag: '已自查 · 打字【重疾】',
    time: '10分钟前',
    comment: '之前以为公司买了 100 万医药卡就什么都不用怕了，测算完才惊醒：如果生大病休养 2 年不上班，每月 RM 4,200 的房贷和车贷谁来还？医药卡根本拿不到一分钱现金，果断预约梳理保单！',
    response: '在大马很多职场精英都有这个盲区：医药卡是赔给医院的，重疾险才是打入个人银行卡的生活替代金。算清这笔账是守护家庭的第一步！',
  },
  {
    author: '陈女士（30岁·雪兰莪二胎全职妈妈）',
    tag: '已自查 · 打字【重疾】',
    time: '25分钟前',
    comment: '【重疾】我们全家都有 Medical Card，但我老公是家里唯一的经济支柱。想算算在大马养育两个孩子，我先生到底需要多少重疾保额才安心，求联系！',
    response: '单一支柱型家庭必须优先锁定至少 3~5 年的全家刚性支出 + 房贷车贷作为保额基线，稍后 WhatsApp 为您发送定制自查表。',
  },
  {
    author: '黄老板（45岁·槟城中小企业主）',
    tag: '已自查 · 打字【重疾】',
    time: '1小时前',
    comment: 'Leo 视频里讲政府医院做手术自费钢板要 RM 5,000~8,000 太真实了！很多人不明白大病康复期收入停摆有多致命。买保险真的不是因为害怕，而是为了守护家人！',
    response: '规划的从来不只是钱，而是在突发风浪来临时，让大马家庭依然拥有尊严、选择权和重新站起来的底气。',
  },
];
