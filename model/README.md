# Machine Learning Pipeline (Python)

โฟลเดอร์นี้บรรจุโค้ดการฝึกสอนและประเมินผลโมเดล Machine Learning ต้นฉบับ พัฒนาโดย **[Jao07Nxne](https://github.com/Jao07Nxne)**

## ไฟล์ในโฟลเดอร์

- `ml.py` — สคริปต์ Python แบบครบวงจร (End-to-End Pipeline) ประกอบด้วย:
  1. การดึงและทำความสะอาดข้อมูลดิบ (Profile, Portfolio, Transcript)
  2. การแก้ปัญหาค่าผิดปกติ (เช่น อายุ 118 ปี) และการจัดการ Missing values
  3. การทำ **As-Of Temporal Target Matching** เชื่อมโยงประวัติการซื้อกับโปรโมชันโดยป้องกัน Data Leakage
  4. การแบ่งชุดข้อมูลแบบ Customer-Disjoint Split (Train 70% / Val 15% / Test 15%)
  5. การเทรนและเปรียบเทียบโมเดล 3 ตัว:
     - **LightGBM Classifier** (Production Champion: ROC-AUC = 0.8241, F1 = 0.7385)
     - **Random Forest** (Ensemble Baseline)
     - **Logistic Regression** (Linear Baseline)
  6. การตรวจสอบ Overfitting (Train AUC 0.842 vs Test AUC 0.821, Gap = 0.021 < 0.05)
  7. การค้นหาจุดตัดเกณฑ์ธุรกิจที่ดีที่สุด (**Optimal Threshold: 0.58**)

## ความสัมพันธ์กับ Web Dashboard

- ในตัว Web App (`src/lib/data/mlData.ts`) ฟังก์ชัน `predictOfferCompletion()` ถูกพอร์ตและ calibrate มาจากสัมประสิทธิ์ Feature Importance ของโมเดล LightGBM จาก `ml.py` เพื่อให้เว็บสามารถคำนวณและทำนายผลบนเบราว์เซอร์ได้แบบเรียลไทม์ (Zero Latency) โดยไม่ต้องรันเซิร์ฟเวอร์ Python แยกต่างหาก
