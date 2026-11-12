export type Gender = 'M' | 'F' | 'O' | 'Unknown';
export type OfferType = 'bogo' | 'discount';

export interface CustomerProfile {
  age: number;
  gender: Gender;
  income: number;
  becameMemberOnYear: number;
  becameMemberOnMonth: number;
  isAgeMissing?: boolean;
  isIncomeMissing?: boolean;
}

export interface OfferDetails {
  id: string;
  name: string;
  offerType: OfferType;
  reward: number;
  difficulty: number;
  durationHours: number;
  channels: {
    email: boolean;
    mobile: boolean;
    social: boolean;
    web: boolean;
  };
}

export interface CustomerHistory {
  pastTransactionCount: number;
  pastTotalSpend: number;
  pastAverageSpend: number;
  pastCompletedCount: number;
  pastReceivedCount: number;
}

export interface PredictionInput {
  profile: CustomerProfile;
  offer: OfferDetails;
  history: CustomerHistory;
}

export interface PredictionResult {
  probability: number;
  threshold: number;
  isPositive: boolean;
  confidenceScore: number;
  recommendation: 'STRONG_SEND' | 'SEND' | 'HOLD' | 'DO_NOT_SEND';
  recommendationTitle: string;
  recommendationReason: string;
  roiEstimate: {
    expectedSpend: number;
    expectedCost: number;
    expectedProfit: number;
    roiPercentage: number;
  };
  keyDrivers: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    description: string;
  }>;
}

export interface ModelMetricComparison {
  name: string;
  tag: string;
  isChampion?: boolean;
  trainType: string;
  accuracy: number;
  f1Score: number;
  rocAuc: number;
  trainTimeSec: number;
  strengths: string[];
  weaknesses: string[];
  parameters: Record<string, string | number>;
}

export interface PipelineStage {
  id: number;
  step: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  recordsProcessed: string;
  details: string;
  codeSnippet: string;
  highlightTitle?: string;
  highlightText?: string;
}

export interface SampleTestCase {
  id: string;
  person: string;
  gender: string;
  age: number;
  income: number;
  offerType: 'bogo' | 'discount';
  difficulty: number;
  reward: number;
  actual: 0 | 1;
  predictedProb: number;
  decision: 0 | 1;
  isCorrect: boolean;
}
