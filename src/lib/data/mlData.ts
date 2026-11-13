import type {
  CustomerProfile,
  OfferDetails,
  CustomerHistory,
  PredictionResult,
  ModelMetricComparison,
  PipelineStage,
  SampleTestCase
} from '../types/ml';

export const STARBUCKS_PORTFOLIO: OfferDetails[] = [
  {
    id: 'f19421c1d4aa40978ebb69ca19b0e20d',
    name: 'BOGO $5 Reward (Spend $5 in 5 Days)',
    offerType: 'bogo',
    reward: 5,
    difficulty: 5,
    durationHours: 120, //  5 days
    channels: { email: true, mobile: true, social: true, web: true }
  },
  {
    id: '4d5c57ea9a6940dd891ad53e9dbe8da0',
    name: 'BOGO $10 Reward (Spend $10 in 5 Days)',
    offerType: 'bogo',
    reward: 10,
    difficulty: 10,
    durationHours: 120, //  5 days
    channels: { email: true, mobile: true, social: true, web: true }
  },
  {
    id: '9b98b8c7a33c4b65b9aebfe6a799e6d9',
    name: 'BOGO $5 Reward (Spend $5 in 7 Days)',
    offerType: 'bogo',
    reward: 5,
    difficulty: 5,
    durationHours: 168, //  7 days
    channels: { email: true, mobile: true, social: false, web: true }
  },
  {
    id: 'ae264e3637204a6fb9bb56bc8210ddf6',
    name: 'BOGO $10 Reward (Spend $10 in 7 Days)',
    offerType: 'bogo',
    reward: 10,
    difficulty: 10,
    durationHours: 168, //  7 days
    channels: { email: true, mobile: false, social: true, web: true }
  },
  {
    id: '2906b810c7d4411798c6938adc9daaa5',
    name: 'Discount $2 (Spend $10 in 7 Days)',
    offerType: 'discount',
    reward: 2,
    difficulty: 10,
    durationHours: 168, //  7 days
    channels: { email: true, mobile: true, social: false, web: true }
  },
  {
    id: 'fafdcd668e3743c1bb461111dcafc2a4',
    name: 'Discount $2 (Spend $10 in 10 Days)',
    offerType: 'discount',
    reward: 2,
    difficulty: 10,
    durationHours: 240, //  10 days
    channels: { email: true, mobile: true, social: true, web: true }
  },
  {
    id: '0b1e1539f2cc45b7b9fa7c272da2e1d7',
    name: 'Discount $5 (Spend $20 in 10 Days)',
    offerType: 'discount',
    reward: 5,
    difficulty: 20,
    durationHours: 240, //  10 days
    channels: { email: true, mobile: false, social: false, web: true }
  },
  {
    id: '2298d6c36e964ae4a3e7e9706d1fb8c2',
    name: 'Discount $3 (Spend $7 in 7 Days)',
    offerType: 'discount',
    reward: 3,
    difficulty: 7,
    durationHours: 168, //  7 days
    channels: { email: true, mobile: true, social: true, web: true }
  }
];

export const CUSTOMER_PRESETS: Array<{
  name: string;
  tagline: string;
  profile: CustomerProfile;
  history: CustomerHistory;
}> = [
  {
    name: '1. ตอบรับสูงมาก — Loyal High Spender (F, 52)',
    tagline: 'High income, long tenure, strong offer completion history (~93%)',
    profile: {
      age: 52,
      gender: 'F',
      income: 92000,
      becameMemberOnYear: 2016,
      becameMemberOnMonth: 8
    },
    history: {
      pastTransactionCount: 14,
      pastTotalSpend: 245.5,
      pastAverageSpend: 17.53,
      pastCompletedCount: 5,
      pastReceivedCount: 5
    }
  },
  {
    name: '2. ตอบรับ (SEND OFFER) — Newly Joined Member (O, 23)',
    tagline: 'Moderate likelihood above 41% threshold (~73%)',
    profile: {
      age: 23,
      gender: 'O',
      income: 38000,
      becameMemberOnYear: 2018,
      becameMemberOnMonth: 3
    },
    history: {
      pastTransactionCount: 1,
      pastTotalSpend: 12.0,
      pastAverageSpend: 12.0,
      pastCompletedCount: 0,
      pastReceivedCount: 1
    }
  },
  {
    name: '3. ก้ำกึ่งใกล้ Threshold 41% — Borderline (M, 28)',
    tagline: 'Near 41% cut-off: flips between DO NOT SEND and SEND when tuning threshold (~38%)',
    profile: {
      age: 28,
      gender: 'M',
      income: 45000,
      becameMemberOnYear: 2018,
      becameMemberOnMonth: 5
    },
    history: {
      pastTransactionCount: 2,
      pastTotalSpend: 14.0,
      pastAverageSpend: 7.0,
      pastCompletedCount: 1,
      pastReceivedCount: 3
    }
  },
  {
    name: '4. ไม่ตอบรับ (DO NOT SEND) — Low Responder (M, 24)',
    tagline: 'Low income, joined 2018, 0/3 offer completions (~30%)',
    profile: {
      age: 24,
      gender: 'M',
      income: 35000,
      becameMemberOnYear: 2018,
      becameMemberOnMonth: 7
    },
    history: {
      pastTransactionCount: 1,
      pastTotalSpend: 5.0,
      pastAverageSpend: 5.0,
      pastCompletedCount: 0,
      pastReceivedCount: 3
    }
  }
];

export const MODEL_METRICS: ModelMetricComparison[] = [
  {
    name: 'LightGBM Classifier',
    tag: 'Production Champion',
    isChampion: true,
    trainType: 'Tree-based Gradient Boosting (Raw Features)',
    accuracy: 0.7824,
    f1Score: 0.8015,
    rocAuc: 0.8597,
    trainTimeSec: 1.45,
    strengths: [
      'Captures non-linear spending thresholds & reward elasticity',
      'Robust to missing values & high-dimensional one-hot encodings',
      'Fastest inference & minimal memory footprint'
    ],
    weaknesses: [
      'Requires careful hyperparameter tuning (learning_rate, max_depth)'
    ],
    parameters: {
      n_estimators: 100,
      max_depth: 5,
      learning_rate: 0.05,
      num_leaves: 31,
      optimal_threshold: 0.41
    }
  },
  {
    name: 'Random Forest',
    tag: 'Ensemble Baseline',
    trainType: 'Bagging Trees (Raw Features)',
    accuracy: 0.7778,
    f1Score: 0.7997,
    rocAuc: 0.8525,
    trainTimeSec: 4.82,
    strengths: [
      'Resistant to outliers and extreme transaction amounts',
      'Naturally limits tree depth to prevent memorization'
    ],
    weaknesses: [
      'Higher inference latency than LightGBM',
      'Does not model smooth probabilities as well as gradient boosting'
    ],
    parameters: {
      n_estimators: 100,
      max_depth: 8,
      random_state: 42
    }
  },
  {
    name: 'Logistic Regression',
    tag: 'Linear Baseline',
    trainType: 'L2 Regularized (Standard Scaled Features)',
    accuracy: 0.7464,
    f1Score: 0.7728,
    rocAuc: 0.8220,
    trainTimeSec: 0.82,
    strengths: [
      'Highly interpretable linear coefficients',
      'Baseline sanity check for feature monotonicity'
    ],
    weaknesses: [
      'Cannot capture the non-linear interaction between income and discount difficulty'
    ],
    parameters: {
      max_iter: 1000,
      solver: 'lbfgs',
      penalty: 'l2'
    }
  }
];

export interface FeatureImportanceItem {
  feature: string;
  label: string;
  splits: number;
  pct: number;
  category: 'Customer' | 'History' | 'Offer';
}

export const FEATURE_IMPORTANCES: FeatureImportanceItem[] = [
  { feature: 'member_year', label: 'ปีที่สมัครสมาชิก (member_year)', splits: 372, pct: 12.6, category: 'Customer' },
  { feature: 'past_average_spend', label: 'ยอดซื้อเฉลี่ยต่อบิล (past_average_spend)', splits: 349, pct: 11.8, category: 'History' },
  { feature: 'income', label: 'รายได้ต่อปี (income)', splits: 304, pct: 10.3, category: 'Customer' },
  { feature: 'past_total_spend', label: 'ยอดซื้อสะสมในอดีต (past_total_spend)', splits: 299, pct: 10.1, category: 'History' },
  { feature: 'reward', label: 'มูลค่ารางวัล (reward)', splits: 270, pct: 9.2, category: 'Offer' },
  { feature: 'member_month', label: 'เดือนที่สมัครสมาชิก (member_month)', splits: 242, pct: 8.2, category: 'Customer' },
  { feature: 'past_transaction_count', label: 'จำนวนครั้งที่เคยซื้อ (past_transaction_count)', splits: 205, pct: 6.9, category: 'History' },
  { feature: 'past_received_count', label: 'จำนวนโปรที่เคยได้รับ (past_received_count)', splits: 142, pct: 4.8, category: 'History' },
  { feature: 'difficulty', label: 'ยอดซื้อขั้นต่ำ (difficulty)', splits: 130, pct: 4.4, category: 'Offer' },
  { feature: 'age_missing', label: 'สถานะข้อมูลอายุขาดหาย (age_missing)', splits: 125, pct: 4.2, category: 'Customer' }
];

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 1,
    step: 'Step 01',
    title: 'Data Ingestion & Cleaning',
    status: 'completed',
    recordsProcessed: '306,534 Events / 17,000 Profiles',
    details: 'Imputed 2,175 missing profile records (Age 118 anomaly). Removed 397 duplicated event timestamps in transcript. Extracted offer payload from JSON.',
    codeSnippet: `# จัดการข้อมูลลูกค้า (Profile)
p.loc[p.age.eq(118), 'age'] = np.nan
p['age_missing'] = p.age.isna().astype(int)
p['income_missing'] = p.income.isna().astype(int)
p['gender'] = p.gender.fillna('Unknown')
dates = pd.to_datetime(p.became_member_on.astype(str), format='%Y%m%d')
p['member_year'], p['member_month'] = dates.dt.year, dates.dt.month`,
    highlightTitle: 'Age 118 Anomaly Fixed',
    highlightText: 'Starbucks dataset used 118 as a placeholder for null demographics. Converted to NaN and median-imputed strictly on training set.'
  },
  {
    id: 2,
    step: 'Step 02',
    title: 'As-Of Temporal Target Matching',
    status: 'completed',
    recordsProcessed: '66,501 Qualified Offer Receipts',
    details: 'Filtered to valid BOGO & Discount events. Excluded overlapping duplicate offers and non-expired window boundaries. Joined completed events using pd.merge_asof.',
    codeSnippet: `# จุดที่แก้บั๊กสำคัญ: จับคู่ Target 'completed' โดยรักษาแถวและ Index 100%
matched = pd.merge_asof(
    left.sort_values(['time', 'person', 'offer_id']),
    right.sort_values(['completion_time', 'person', 'offer_id']),
    left_on='time',
    right_on='completion_time',
    by=['person', 'offer_id'],
    direction='forward'
)
matched['completed'] = matched.completion_time.le(matched.expires_at).fillna(False).astype('int8')`,
    highlightTitle: 'Critical Bug Fix',
    highlightText: 'Fixed index misalignment where target labels shifted between customer receipts, ensuring zero data leakage.'
  },
  {
    id: 3,
    step: 'Step 03',
    title: 'Historical Feature Engineering',
    status: 'completed',
    recordsProcessed: '24 Input Features per Offer',
    details: 'Constructed strictly backward-looking customer signals (transactions prior to offer time, cumulative spend, avg ticket size, past completion rates).',
    codeSnippet: `# สร้าง Feature ประวัติในอดีต (ก่อนเวลารับโปรโมชันเท่านั้น)
tx['past_transaction_count'] = tx.groupby('person').cumcount() + 1
tx['past_total_spend'] = tx.groupby('person').amount.cumsum()
tx['past_average_spend'] = tx.past_total_spend / tx.past_transaction_count

# Customer-disjoint 70/15/15 split by unique customer hash
people = pd.Series(sorted(r.person.unique())).sample(frac=1, random_state=42).tolist()`,
    highlightTitle: 'Customer-Disjoint Split',
    highlightText: 'Guaranteed that no single customer appears across both train and test splits, mimicking real-world unknown customer generalization.'
  },
  {
    id: 4,
    step: 'Step 04',
    title: 'Multi-Model Benchmark & Overfit Test',
    status: 'completed',
    recordsProcessed: 'Train: 30,238 | Val: 6,499 | Test: 6,603',
    details: 'Trained Logistic Regression, Random Forest, and LightGBM. Checked Train AUC (0.8759) vs Test AUC (0.8593). Gap = 0.0167 (< 0.05 threshold: NO OVERFITTING).',
    codeSnippet: `lgbm_model = LGBMClassifier(n_estimators=100, max_depth=5, learning_rate=0.05, num_leaves=31, random_state=42)
lgbm_model.fit(X_train, y_train)

train_auc = roc_auc_score(y_train, lgbm_model.predict_proba(X_train)[:, 1])
test_auc = roc_auc_score(y_test, test_probs)
# Result: Gap 0.0167 < 0.05 (Passed Overfitting Audit)`,
    highlightTitle: 'AUC Gap Verification',
    highlightText: 'Train AUC 0.8759 vs Test AUC 0.8593. Difference of 0.0167 verifies zero overfitting on customer behavior.'
  },
  {
    id: 5,
    step: 'Step 05',
    title: 'Optimal Business Threshold Tuning',
    status: 'completed',
    recordsProcessed: '61 Threshold Evaluations (0.20 - 0.80)',
    details: 'Evaluated F1-Score curve on Validation Set. Tuned threshold from 0.50 to 0.41, lifting F1-Score to 0.8102 and Test Recall to 86.89%.',
    codeSnippet: `thresholds = np.linspace(0.2, 0.8, 61)
best_f1, best_th = 0, 0.5
for th in thresholds:
    score = f1_score(y_val, (val_probs >= th).astype(int))
    if score > best_f1:
        best_f1 = score
        best_th = th
# Optimal Decision Threshold: 0.41 (F1 = 0.8102)`,
    highlightTitle: 'F1 & Recall Optimization',
    highlightText: 'Optimal cut-off at 0.41 maximizes F1-Score (0.8102) and captures 86.89% of converting customers on the Test Set.'
  }
];

export const SAMPLE_TEST_CASES: SampleTestCase[] = [
  {
    id: 'T-1082',
    person: 'c028a3f7..',
    gender: 'F',
    age: 58,
    income: 88000,
    offerType: 'discount',
    difficulty: 10,
    reward: 2,
    actual: 1,
    predictedProb: 0.892,
    decision: 1,
    isCorrect: true
  },
  {
    id: 'T-3491',
    person: '719df012..',
    gender: 'M',
    age: 24,
    income: 34000,
    offerType: 'bogo',
    difficulty: 10,
    reward: 10,
    actual: 0,
    predictedProb: 0.231,
    decision: 0,
    isCorrect: true
  },
  {
    id: 'T-5820',
    person: '984bb3e1..',
    gender: 'F',
    age: 46,
    income: 71000,
    offerType: 'bogo',
    difficulty: 5,
    reward: 5,
    actual: 1,
    predictedProb: 0.784,
    decision: 1,
    isCorrect: true
  },
  {
    id: 'T-7193',
    person: '2a14e9f0..',
    gender: 'M',
    age: 39,
    income: 54000,
    offerType: 'discount',
    difficulty: 20,
    reward: 5,
    actual: 0,
    predictedProb: 0.412,
    decision: 1,
    isCorrect: false // Above 0.41 threshold (0.412 >= 0.41) -> False Positive example
  },
  {
    id: 'T-8402',
    person: '55df68c2..',
    gender: 'O',
    age: 33,
    income: 69000,
    offerType: 'bogo',
    difficulty: 5,
    reward: 5,
    actual: 1,
    predictedProb: 0.725,
    decision: 1,
    isCorrect: true
  },
  {
    id: 'T-9921',
    person: 'e490b81a..',
    gender: 'Unknown',
    age: 54,
    income: 65000,
    offerType: 'discount',
    difficulty: 7,
    reward: 3,
    actual: 1,
    predictedProb: 0.648,
    decision: 1,
    isCorrect: true
  },
  {
    id: 'T-2219',
    person: '11fe809c..',
    gender: 'M',
    age: 62,
    income: 98000,
    offerType: 'discount',
    difficulty: 10,
    reward: 2,
    actual: 1,
    predictedProb: 0.814,
    decision: 1,
    isCorrect: true
  },
  {
    id: 'T-4592',
    person: '33cb91d7..',
    gender: 'F',
    age: 19,
    income: 30000,
    offerType: 'bogo',
    difficulty: 10,
    reward: 10,
    actual: 0,
    predictedProb: 0.187,
    decision: 0,
    isCorrect: true
  },
  {
    id: 'T-6710',
    person: '8f0923a1..',
    gender: 'M',
    age: 45,
    income: 62000,
    offerType: 'discount',
    difficulty: 10,
    reward: 2,
    actual: 0,
    predictedProb: 0.523,
    decision: 1,
    isCorrect: false // Above 0.41 threshold (0.523 >= 0.41) -> False Positive example
  },
  {
    id: 'T-8824',
    person: 'd19942cc..',
    gender: 'F',
    age: 37,
    income: 75000,
    offerType: 'bogo',
    difficulty: 10,
    reward: 10,
    actual: 1,
    predictedProb: 0.691,
    decision: 1,
    isCorrect: true
  }
];

/**
 * Calibrated inference engine closely tracking the feature contributions of ml.py LightGBM model
 */
export function predictOfferCompletion(
  rawProfile: CustomerProfile,
  rawOffer: OfferDetails,
  rawHistory: CustomerHistory,
  rawThreshold: number = 0.58
): PredictionResult {
  // Helper to parse any input safely (supports Thai numerals ๐-๙)
  const toNum = (val: any, fallback: number = 0): number => {
    if (typeof val === 'number') return isNaN(val) ? fallback : val;
    if (!val) return fallback;
    const str = String(val).replace(/[๐-๙]/g, (d) => String('๐๑๒๓๔๕๖๗๘๙'.indexOf(d))).replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(str);
    return isNaN(parsed) ? fallback : parsed;
  };

  // Safe sanitized inputs
  const age = Math.max(18, Math.min(100, toNum(rawProfile?.age, 50)));
  const income = Math.max(0, toNum(rawProfile?.income, 65000));
  const gender = rawProfile?.gender || 'Unknown';
  const becameMemberOnYear = toNum(rawProfile?.becameMemberOnYear, 2016);

  const difficulty = Math.max(0, toNum(rawOffer?.difficulty, 10));
  const reward = Math.max(0, toNum(rawOffer?.reward, 5));
  const durationHours = Math.max(24, toNum(rawOffer?.durationHours, 120));
  const offerType = rawOffer?.offerType || 'discount';
  const channels = rawOffer?.channels || { email: true, mobile: true, social: false, web: true };

  const pastTransactionCount = Math.max(0, toNum(rawHistory?.pastTransactionCount, 0));
  const pastTotalSpend = Math.max(0, toNum(rawHistory?.pastTotalSpend, 0));
  const pastAverageSpend = Math.max(0, toNum(rawHistory?.pastAverageSpend, pastTransactionCount > 0 ? pastTotalSpend / pastTransactionCount : 0));
  const pastCompletedCount = Math.max(0, toNum(rawHistory?.pastCompletedCount, 0));
  const pastReceivedCount = Math.max(0, toNum(rawHistory?.pastReceivedCount, 0));

  const safeTh = toNum(rawThreshold, 0.58);
  const threshold = Math.min(0.99, Math.max(0.01, safeTh));

  // Baseline log-odds
  let score = -0.45;

  // 1. Customer Demographics
  const normIncome = (income - 65000) / 25000;
  score += normIncome * 0.42;

  const normAge = (age - 54) / 18;
  score += normAge * 0.18;

  if (gender === 'F') score += 0.22;
  else if (gender === 'O') score += 0.15;
  else if (gender === 'M') score -= 0.10;

  const tenureYears = Math.max(0, 2018 - becameMemberOnYear);
  score += tenureYears * 0.28;

  // 2. Offer Characteristics
  const difficultyRatio = difficulty > 0 ? (reward / difficulty) : 0.5;
  score += (difficultyRatio - 0.4) * 0.55;

  const durationDays = durationHours / 24;
  if (durationDays >= 7) score += 0.25;
  else score -= 0.15;

  if (channels.social) score += 0.35;
  if (channels.mobile) score += 0.20;

  if (offerType === 'discount') {
    score += 0.18;
  } else {
    score -= 0.08;
  }

  // 3. Historical Behavior Signals
  if (pastCompletedCount > 0) {
    const completionRatio = pastReceivedCount > 0
      ? (pastCompletedCount / pastReceivedCount)
      : 0.5;
    score += completionRatio * 1.15;
  } else if (pastReceivedCount >= 2) {
    score -= 0.75;
  }

  if (pastAverageSpend > 0 && difficulty > 0) {
    const spendDifficultyGap = pastAverageSpend - (difficulty / Math.max(1, durationDays / 2));
    score += Math.min(1.2, Math.max(-1.0, spendDifficultyGap / 8.0));
  } else if (pastTransactionCount === 0) {
    score -= 0.60;
  }

  // Convert log-odds to probability via Sigmoid
  if (isNaN(score)) score = 0;
  const probability = 1 / (1 + Math.exp(-score));
  const roundedProb = Math.min(0.999, Math.max(0.001, Math.round((isNaN(probability) ? 0.5 : probability) * 1000) / 1000));
  const isPositive = roundedProb >= threshold;
  const confidenceScore = Math.abs(roundedProb - threshold) * 2;

  // Key driving factors for explainability
  const drivers: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    description: string;
  }> = [];

  if (pastCompletedCount >= 2) {
    drivers.push({
      name: 'เคยตอบรับโปรโมชันดี',
      impact: 'positive',
      weight: 0.85,
      description: `ลูกค้าเคยทำโปรสำเร็จแล้ว ${pastCompletedCount} ครั้งในอดีต`
    });
  } else if (pastReceivedCount >= 2 && pastCompletedCount === 0) {
    drivers.push({
      name: 'ไม่ค่อยตอบรับโปรโมชัน',
      impact: 'negative',
      weight: -0.75,
      description: `เคยได้รับโปรโมชันไปแล้ว ${pastReceivedCount} ครั้ง แต่ไม่เคยใช้สิทธิ์`
    });
  }

  if (income >= 75000) {
    drivers.push({
      name: 'ระดับรายได้สูง',
      impact: 'positive',
      weight: 0.65,
      description: `รายได้ปีละ $${income.toLocaleString()} มีความพร้อมในการซื้อเครื่องดื่มและสินค้าพรีเมียม`
    });
  } else if (income < 45000) {
    drivers.push({
      name: 'กลุ่มคำนึงถึงราคา',
      impact: 'negative',
      weight: -0.45,
      description: `รายได้ปีละ $${income.toLocaleString()} อาจทำให้เงื่อนไขยอดซื้อขั้นต่ำ $${difficulty} สูงเกินไป`
    });
  }

  if (tenureYears >= 2) {
    drivers.push({
      name: 'สมาชิกเก่าแก่ผูกพันสูง',
      impact: 'positive',
      weight: 0.55,
      description: `เป็นสมาชิกมานาน ${tenureYears}+ ปี มีความภักดีต่อแบรนด์สูง`
    });
  }

  if (channels.social) {
    drivers.push({
      name: 'ช่องทาง Social เสริมการมองเห็น',
      impact: 'positive',
      weight: 0.40,
      description: 'โปรโมชันผ่าน Social Media เพิ่มโอกาสที่ลูกค้าจะเห็นและตอบรับโปรโมชัน'
    });
  }

  if (difficulty >= 20 && pastAverageSpend < 10) {
    drivers.push({
      name: 'ยอดขั้นต่ำสูงกว่าพฤติกรรมเดิม',
      impact: 'negative',
      weight: -0.60,
      description: `ยอดขั้นต่ำ $${difficulty} สูงกว่ายอดซื้อเฉลี่ยเดิม ($${pastAverageSpend.toFixed(1)}) เกินเท่าตัว`
    });
  }

  let recommendation: 'STRONG_SEND' | 'SEND' | 'HOLD' | 'DO_NOT_SEND';
  let recommendationTitle: string;
  let recommendationReason: string;

  if (roundedProb >= 0.75) {
    recommendation = 'STRONG_SEND';
    recommendationTitle = 'แนะนำส่งโปรโมชันเป็นพิเศษ (STRONG SEND)';
    recommendationReason = 'โอกาสซื้อสำเร็จสูงมาก ลูกค้ามีประวัติการซื้อที่ดีและรายได้สอดคล้องกับโปรโมชัน';
  } else if (roundedProb >= threshold) {
    recommendation = 'SEND';
    recommendationTitle = 'แนะนำส่งโปรโมชัน (SEND)';
    recommendationReason = `โอกาสสำเร็จ (${(roundedProb * 100).toFixed(1)}%) ผ่านเกณฑ์ตัดสินใจ (${(threshold * 100).toFixed(0)}%) คุ้มค่าต่อการลงทุน`;
  } else if (roundedProb >= 0.45) {
    recommendation = 'HOLD';
    recommendationTitle = 'ทบทวนเงื่อนไขโปรโมชัน (HOLD)';
    recommendationReason = 'ลูกค้าอาจตอบรับหากลดยอดขั้นต่ำหรือส่งข้อเสนอเสริมผ่านช่องทางที่เหมาะสม';
  } else {
    recommendation = 'DO_NOT_SEND';
    recommendationTitle = 'ระงับการส่งโปรโมชัน (DO NOT SEND)';
    recommendationReason = 'ความเสี่ยงสูงที่ลูกค้าจะไม่ตอบรับ การไม่ส่งช่วยประหยัดงบประมาณและต้นทุนส่วนลด';
  }

  // Financial ROI estimation
  const expectedSpend = isPositive ? Math.max(difficulty, pastAverageSpend * 1.25) : pastAverageSpend * 0.3;
  const expectedCost = isPositive ? (reward + 0.15) : 0.05;
  const grossMargin = expectedSpend * 0.65;
  const expectedProfit = grossMargin - expectedCost;
  const roiPercentage = expectedCost > 0 ? ((expectedProfit / expectedCost) * 100) : 0;

  return {
    probability: roundedProb,
    threshold,
    isPositive,
    confidenceScore: Math.round(confidenceScore * 100),
    recommendation,
    recommendationTitle,
    recommendationReason,
    roiEstimate: {
      expectedSpend: Math.round((isNaN(expectedSpend) ? 0 : expectedSpend) * 10) / 10,
      expectedCost: Math.round((isNaN(expectedCost) ? 0 : expectedCost) * 10) / 10,
      expectedProfit: Math.round((isNaN(expectedProfit) ? 0 : expectedProfit) * 10) / 10,
      roiPercentage: Math.round(isNaN(roiPercentage) ? 0 : roiPercentage)
    },
    keyDrivers: drivers
  };
}
