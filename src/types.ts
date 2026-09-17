export type VoiceName = 'Leo';

export interface VoiceOption {
  id: VoiceName;
  name: string;
  description: string;
  gender: 'male';
  badge?: string;
}

export interface CalculatorState {
  monthlyLiving: number;       // 月度基础生活费 (元)
  monthlyDebt: number;         // 月度房贷/车贷/刚性债务 (元)
  annualEducation: number;     // 子女年教育及父母赡养储备 (元/年)
  recoveryYears: number;       // 预计大病休养康复周期 (年, 默认3年)
  specialCare: number;         // 康复护理/进口药物/特需门诊储备 (元)
  existingCoverage: number;    // 目前已有重疾保额 (元)
  emergencyFund: number;       // 目前流动应急备用金 (元)
}

export interface CalculationResult {
  incomeReplacement: number;   // 康复期日常生活替代金
  debtCoverage: number;        // 康复期刚性债务还款金
  educationFund: number;       // 康复期子女与赡养专项金
  specialCareFund: number;     // 康复护理与特需金
  suggestedCoverage: number;   // 建议重疾总保额
  gap: number;                 // 保障缺口
  resilienceScore: number;     // 家庭抗风险安全得分 (0-100)
  riskLevel: 'critical' | 'warning' | 'adequate' | 'excellent';
  riskTitle: string;
  riskDescription: string;
}

export interface ConsultationRequest {
  id: string;
  contactName: string;
  contactMethod: string;
  familyStructure: string;
  existingPolicyStatus: string;
  focusAreas: string[];
  note: string;
  calculatedGap?: number;
  createdAt: string;
  formattedDateTime?: string;
  status?: 'pending' | 'contacted' | 'completed';
  plannerNotes?: string;
}

export interface LeoBrandPillar {
  id: string;
  number: string;
  title: string;
  slogan: string;
  description: string;
  isCurrentToolCore?: boolean;
  color: string;
}
