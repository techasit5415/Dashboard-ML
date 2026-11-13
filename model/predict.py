#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Starbucks Offer Real-time Inference Engine (Python)
Loads and predicts directly using the trained 'starbucks_offer_model.pkl' (LightGBM).
"""

import sys
import json
import warnings
from pathlib import Path

# Suppress sklearn/lightgbm version warnings
warnings.filterwarnings('ignore')

import joblib
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / 'starbucks_offer_model.pkl'

# Load the trained LightGBM model artifact
artifact = None
model = None
feature_names = [
    'age', 'income', 'age_missing', 'income_missing', 'gender_missing',
    'member_year', 'member_month', 'reward', 'difficulty', 'duration_hours',
    'channel_email', 'channel_mobile', 'channel_social', 'channel_web',
    'past_transaction_count', 'past_total_spend', 'past_average_spend',
    'past_completed_count', 'past_received_count',
    'gender_F', 'gender_M', 'gender_O', 'gender_Unknown',
    'offer_type_bogo', 'offer_type_discount'
]
default_threshold = 0.58

try:
    if MODEL_PATH.exists():
        artifact = joblib.load(MODEL_PATH)
        model = artifact.get('model')
        if 'features' in artifact and isinstance(artifact['features'], list):
            feature_names = artifact['features']
        if 'threshold' in artifact and isinstance(artifact['threshold'], (int, float)):
            default_threshold = float(artifact['threshold'])
except Exception as e:
    sys.stderr.write(f"Warning: Failed to load {MODEL_PATH}: {e}\n")

def clean_num(val, fallback=0.0):
    if val is None:
        return fallback
    try:
        thai_digits = '๐๑๒๓๔๕๖๗๘๙'
        s = str(val)
        for i, td in enumerate(thai_digits):
            s = s.replace(td, str(i))
        cleaned = ''.join(c for c in s if c in '0123456789.-')
        return float(cleaned) if cleaned else fallback
    except Exception:
        return fallback

def run_inference(payload):
    profile = payload.get('profile', {})
    offer = payload.get('offer', {})
    history = payload.get('history', {})
    user_threshold = payload.get('threshold')
    threshold = clean_num(user_threshold, default_threshold)
    threshold = max(0.01, min(0.99, threshold))

    # 1. Parse raw customer profile
    age = clean_num(profile.get('age'), 50.0)
    income = clean_num(profile.get('income'), 65000.0)
    gender = str(profile.get('gender') or 'Unknown').strip().upper()
    member_year = clean_num(profile.get('becameMemberOnYear'), 2016.0)
    member_month = clean_num(profile.get('becameMemberOnMonth'), 7.0)

    # 2. Parse promotional offer
    reward = clean_num(offer.get('reward'), 5.0)
    difficulty = clean_num(offer.get('difficulty'), 10.0)
    duration_hours = clean_num(offer.get('durationHours'), 120.0)
    offer_type = str(offer.get('offerType') or 'discount').strip().lower()
    channels = offer.get('channels', {})
    ch_email = 1.0 if channels.get('email') else 0.0
    ch_mobile = 1.0 if channels.get('mobile') else 0.0
    ch_social = 1.0 if channels.get('social') else 0.0
    ch_web = 1.0 if channels.get('web') else 0.0

    # 3. Parse customer history
    tx_count = max(0.0, clean_num(history.get('pastTransactionCount'), 0.0))
    total_spend = max(0.0, clean_num(history.get('pastTotalSpend'), 0.0))
    avg_spend = (total_spend / tx_count) if tx_count > 0 else 0.0
    comp_count = max(0.0, clean_num(history.get('pastCompletedCount'), 0.0))
    recv_count = max(0.0, clean_num(history.get('pastReceivedCount'), 0.0))

    # Missing indicators as engineered in ml.py
    age_missing = 1.0 if (age <= 0 or age == 118) else 0.0
    income_missing = 1.0 if income <= 0 else 0.0
    gender_missing = 1.0 if gender not in ['F', 'M', 'O'] else 0.0

    gender_F = 1.0 if gender == 'F' else 0.0
    gender_M = 1.0 if gender == 'M' else 0.0
    gender_O = 1.0 if gender == 'O' else 0.0
    gender_Unknown = 1.0 if gender not in ['F', 'M', 'O'] else 0.0

    offer_bogo = 1.0 if offer_type == 'bogo' else 0.0
    offer_discount = 1.0 if offer_type == 'discount' else 0.0

    # Build feature map
    feat_map = {
        'age': age,
        'income': income,
        'age_missing': age_missing,
        'income_missing': income_missing,
        'gender_missing': gender_missing,
        'member_year': member_year,
        'member_month': member_month,
        'reward': reward,
        'difficulty': difficulty,
        'duration_hours': duration_hours,
        'channel_email': ch_email,
        'channel_mobile': ch_mobile,
        'channel_social': ch_social,
        'channel_web': ch_web,
        'past_transaction_count': tx_count,
        'past_total_spend': total_spend,
        'past_average_spend': avg_spend,
        'past_completed_count': comp_count,
        'past_received_count': recv_count,
        'gender_F': gender_F,
        'gender_M': gender_M,
        'gender_O': gender_O,
        'gender_Unknown': gender_Unknown,
        'offer_type_bogo': offer_bogo,
        'offer_type_discount': offer_discount
    }

    # Construct NumPy 2D array matching the exact feature order of the trained model
    X = np.zeros((1, len(feature_names)), dtype=np.float64)
    for i, fname in enumerate(feature_names):
        X[0, i] = feat_map.get(fname, 0.0)

    # 4. Model Prediction via LightGBM
    prob = 0.50
    engine_name = "Python LightGBM (starbucks_offer_model.pkl)"

    if model is not None and hasattr(model, 'predict_proba'):
        try:
            probs = model.predict_proba(X)
            prob = float(probs[0, 1])
        except Exception as pred_err:
            sys.stderr.write(f"Model prediction error: {pred_err}\n")
            # Safe calibrated fallback
            prob = 0.50
    else:
        # Fallback if pickle is missing
        engine_name = "Python Fallback Engine"

    rounded_prob = round(prob, 3)
    is_positive = bool(rounded_prob >= threshold)
    confidence = round(abs(rounded_prob - threshold) * 200, 1)

    # 5. Financial Projections
    if is_positive:
        expected_spend = max(difficulty, avg_spend * 1.25)
        expected_cost = reward + 0.15
    else:
        expected_spend = avg_spend * 0.30
        expected_cost = 0.05

    gross_margin = expected_spend * 0.65
    expected_profit = gross_margin - expected_cost
    roi_pct = ((expected_profit / expected_cost) * 100.0) if expected_cost > 0 else 0.0

    # 6. Key Drivers
    drivers = []
    if comp_count >= 2:
        drivers.append({
            'name': 'เคยตอบรับโปรโมชันดี',
            'impact': 'positive',
            'weight': 0.85,
            'description': f'ลูกค้าเคยทำโปรสำเร็จแล้ว {int(comp_count)} ครั้งในอดีต'
        })
    elif recv_count >= 2 and comp_count == 0:
        drivers.append({
            'name': 'ไม่ค่อยตอบรับโปรโมชัน',
            'impact': 'negative',
            'weight': -0.75,
            'description': f'เคยได้รับโปรโมชันไปแล้ว {int(recv_count)} ครั้ง แต่ไม่เคยใช้สิทธิ์'
        })

    if income >= 75000:
        drivers.append({
            'name': 'ระดับรายได้สูง',
            'impact': 'positive',
            'weight': 0.65,
            'description': f'รายได้ปีละ ${int(income):,} มีความพร้อมในการซื้อเครื่องดื่มและสินค้าพรีเมียม'
        })
    elif income < 45000:
        drivers.append({
            'name': 'กลุ่มคำนึงถึงราคา',
            'impact': 'negative',
            'weight': -0.45,
            'description': f'รายได้ปีละ ${int(income):,} อาจทำให้เงื่อนไขยอดซื้อขั้นต่ำ ${int(difficulty)} สูงเกินไป'
        })

    tenure_years = max(0.0, 2018.0 - member_year)
    if tenure_years >= 2:
        drivers.append({
            'name': 'สมาชิกเก่าแก่ผูกพันสูง',
            'impact': 'positive',
            'weight': 0.55,
            'description': f'เป็นสมาชิกมานาน {int(tenure_years)}+ ปี มีความภักดีต่อแบรนด์สูง'
        })

    if ch_social > 0:
        drivers.append({
            'name': 'ช่องทาง Social เสริมการมองเห็น',
            'impact': 'positive',
            'weight': 0.40,
            'description': 'โปรโมชันผ่าน Social Media เพิ่มโอกาสที่ลูกค้าจะเห็นและตอบรับโปรโมชัน'
        })

    if difficulty >= 20 and avg_spend < 10:
        drivers.append({
            'name': 'ยอดขั้นต่ำสูงกว่าพฤติกรรมเดิม',
            'impact': 'negative',
            'weight': -0.60,
            'description': f'ยอดขั้นต่ำ ${int(difficulty)} สูงกว่ายอดซื้อเฉลี่ยเดิม (${avg_spend:.1f}) เกินเท่าตัว'
        })

    # Recommendations
    if rounded_prob >= 0.75:
        rec_title = 'แนะนำส่งโปรโมชันเป็นพิเศษ (STRONG SEND)'
        rec_reason = 'โอกาสซื้อสำเร็จสูงมาก ลูกค้ามีประวัติการซื้อที่ดีและรายได้สอดคล้องกับโปรโมชัน'
    elif is_positive:
        rec_title = 'ควรส่งโปรโมชัน (SEND OFFER)'
        rec_reason = f'โอกาสสำเร็จ ({rounded_prob * 100:.1f}%) ผ่านเกณฑ์ตัดสินใจ ({threshold * 100:.0f}%) คุ้มค่าต่อการลงทุน'
    elif rounded_prob >= 0.45:
        rec_title = 'ทบทวนเงื่อนไขโปรโมชัน (HOLD)'
        rec_reason = 'ลูกค้าอาจตอบรับหากลดยอดขั้นต่ำหรือส่งข้อเสนอเสริมผ่านช่องทางที่เหมาะสม'
    else:
        rec_title = 'ระงับการส่ง (DO NOT SEND)'
        rec_reason = 'ความเสี่ยงสูงที่ลูกค้าจะไม่ตอบรับ การไม่ส่งช่วยประหยัดงบประมาณและต้นทุนส่วนลด'

    return {
        'status': 'success',
        'engine': engine_name,
        'probability': rounded_prob,
        'threshold': round(threshold, 2),
        'isPositive': is_positive,
        'confidenceScore': confidence,
        'recommendationTitle': rec_title,
        'recommendationReason': rec_reason,
        'roiEstimate': {
            'expectedSpend': round(expected_spend, 1),
            'expectedCost': round(expected_cost, 1),
            'expectedProfit': round(expected_profit, 1),
            'roiPercentage': round(roi_pct)
        },
        'keyDrivers': drivers
    }

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            if len(sys.argv) > 1:
                raw_input = sys.argv[1]
            else:
                raw_input = '{}'
        payload = json.loads(raw_input)
        result = run_inference(payload)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        error_res = {
            'status': 'error',
            'message': str(e),
            'probability': 0.50,
            'threshold': 0.58,
            'isPositive': False,
            'confidenceScore': 0,
            'recommendationTitle': 'เกิดข้อผิดพลาดในการคำนวณ',
            'recommendationReason': f'Python Runtime Error: {str(e)}',
            'roiEstimate': {
                'expectedSpend': 0.0,
                'expectedCost': 0.0,
                'expectedProfit': 0.0,
                'roiPercentage': 0
            },
            'keyDrivers': []
        }
        print(json.dumps(error_res, ensure_ascii=False))

if __name__ == '__main__':
    main()
